import { Server } from 'socket.io';
import { verifyToken } from '../services/auth.service.js';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { PartnerConnection } from '../models/PartnerConnection.js';
import { Task } from '../models/Task.js';
import { StudySession } from '../models/StudySession.js';
import { createPartnerNotification } from '../services/notification.service.js';

let ioInstance = null;

// Helper to recalculate and broadcast authoritative progress & streak
const recalculateAndBroadcastProgress = async (io, roomCode, userId, userName) => {
  if (!userId || !roomCode) return;
  try {
    const totalTasks = await Task.countDocuments({ owner: userId });
    const completedTasks = await Task.countDocuments({ owner: userId, completed: true });
    const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const user = await User.findById(userId);

    const progressPayload = {
      userId,
      userName,
      totalTasks,
      completedTasks,
      percentage,
      progressPercent: percentage,
      streak: user?.streak || 0,
      currentStreak: user?.streak || 0,
      timestamp: new Date().toISOString(),
    };

    io.to(roomCode).emit('progress_updated', progressPayload);
    io.to(roomCode).emit('partner_progress_updated', progressPayload);

    const streakPayload = {
      userId,
      userName,
      streak: user?.streak || 0,
      currentStreak: user?.streak || 0,
      timestamp: new Date().toISOString(),
    };

    io.to(roomCode).emit('streak_updated', streakPayload);
    io.to(roomCode).emit('partner_streak_updated', streakPayload);

    io.to(roomCode).emit('analytics_updated', {
      userId,
      userName,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Socket.IO Progress] Error calculating progress:', err.message);
  }
};

// Track active sockets per user ID to handle multiple tabs/reconnects
const userSocketsMap = new Map();

/**
 * Initialize Socket.IO with HTTP Server
 * Supports room-based partner pairing, real-time study events, online presence, and WebRTC signaling hooks
 */
export const initSocket = (httpServer) => {
  const allowedOrigins = config.isProduction
    ? [...config.clientOrigins]
    : [
        ...config.clientOrigins,
        config.clientOrigin,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:3000',
      ];

  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });


  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

      if (token) {
        const decoded = verifyToken(token);
        if (decoded && decoded.userId) {
          socket.user = decoded;
          return next();
        }
      }

      // Guest connection allowed but unauthenticated
      socket.user = null;
      next();
    } catch (err) {
      console.warn('[Socket.IO Auth] Error verifying token:', err.message);
      socket.user = null;
      next();
    }
  });

  io.on('connection', async (socket) => {
    const userId = socket.user?.userId;
    const userName = socket.user?.name || 'Study Partner';

    console.log(`[Socket.IO] Client connected: ${socket.id} (${userName} / ${userId || 'guest'})`);

    // Handle authenticated user presence
    if (userId) {
      // Auto-join user-specific room for private targeted notifications
      socket.join(`user_${userId}`);

      if (!userSocketsMap.has(userId)) {
        userSocketsMap.set(userId, new Set());
      }
      userSocketsMap.get(userId).add(socket.id);

      // Update database online status
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: true,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.warn('[Socket.IO] Could not update online status in DB:', err.message);
      }

      // Automatically join partner room if connection exists
      try {
        const connection = await PartnerConnection.findOne({
          $or: [{ user1: userId }, { user2: userId }],
          status: 'active',
        });

        if (connection) {
          const roomCode = connection.roomCode;
          socket.join(roomCode);
          socket.currentRoom = roomCode;
          socket.partnerConnectionId = connection._id.toString();

          // Notify partner room of online status
          socket.to(roomCode).emit('partner_status_changed', {
            userId,
            userName,
            isOnline: true,
            lastSeen: new Date().toISOString(),
          });

          console.log(`[Socket.IO] User ${userName} auto-joined partner room ${roomCode}`);
        }
      } catch (err) {
        console.warn('[Socket.IO] Could not auto-join partner room:', err.message);
      }
    }

    // --- Explicit Partner Room Joining ---
    socket.on('join_partner_room', async ({ roomCode }) => {
      if (!roomCode || typeof roomCode !== 'string') {
        return socket.emit('error', { message: 'Invalid room code provided.' });
      }

      const normalizedCode = roomCode.trim().toUpperCase();

      // Security check: If authenticated, verify membership in database
      if (userId) {
        try {
          const connection = await PartnerConnection.findOne({
            roomCode: normalizedCode,
            $or: [{ user1: userId }, { user2: userId }],
          });

          if (!connection) {
            return socket.emit('error', {
              message: 'Unauthorized: You are not a member of this study partner room.',
            });
          }
        } catch (err) {
          console.warn('[Socket.IO] Error validating room membership:', err.message);
        }
      }

      socket.join(normalizedCode);
      socket.currentRoom = normalizedCode;

      const room = io.sockets.adapter.rooms.get(normalizedCode);
      const memberCount = room ? room.size : 1;

      console.log(`[Socket.IO] ${socket.id} joined room ${normalizedCode} (${memberCount} client(s))`);

      // Notify other members
      socket.to(normalizedCode).emit('partner_connected', {
        userId: userId || socket.id,
        userName,
        socketId: socket.id,
        isOnline: true,
        memberCount,
        timestamp: new Date().toISOString(),
      });

      socket.emit('room_joined', {
        roomCode: normalizedCode,
        memberCount,
      });
    });

    socket.on('leave_partner_room', () => {
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('partner_disconnected', {
          userId: userId || socket.id,
          userName,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
        socket.leave(socket.currentRoom);
        socket.currentRoom = null;
      }
    });

    // --- REAL-TIME TASK EVENTS (STEP 5) ---

    // 1. Task Created
    socket.on('task_created', async (data) => {
      if (!socket.currentRoom) return;

      const payload = {
        task: data?.task,
        userId: userId || socket.id,
        userName,
        timestamp: new Date().toISOString(),
      };

      // Emit both task_created and partner_task_created for flexible client listening
      socket.to(socket.currentRoom).emit('task_created', payload);
      socket.to(socket.currentRoom).emit('partner_task_created', payload);

      // Notification
      socket.to(socket.currentRoom).emit('notification_created', {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Task Created',
        text: `${userName} created "${data?.task?.title || 'a new task'}"`,
        type: 'task',
        timestamp: new Date().toISOString(),
        actor: 'partner',
      });

      if (userId) {
        await recalculateAndBroadcastProgress(io, socket.currentRoom, userId, userName);
      }
    });

    // 2. Task Completed (triggers remote virtual hug on partner screen)
    socket.on('task_completed', async (data) => {
      if (!socket.currentRoom) return;

      const payload = {
        taskId: data?.taskId || data?.task?.id,
        task: data?.task,
        userId: userId || socket.id,
        userName,
        completedAt: new Date().toISOString(),
        message: `${userName} completed a task! Virtual hug unlocked 🫂`,
        timestamp: new Date().toISOString(),
      };

      socket.to(socket.currentRoom).emit('task_completed', payload);
      socket.to(socket.currentRoom).emit('partner_task_completed', payload);

      // Notification fallback for unauthenticated connections
      if (!userId) {
        socket.to(socket.currentRoom).emit('notification_created', {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: 'Task Completed! 🎉',
          text: `${userName} finished "${(data?.task?.title || 'a study task').split('—')[0].trim()}". Virtual hug unlocked 🫂`,
          type: 'task',
          timestamp: new Date().toISOString(),
          actor: 'partner',
        });
      }

      // Persist real-time partner notification in MongoDB
      if (userId) {
        createPartnerNotification({
          currentUserId: userId,
          partnerConnectionId: socket.partnerConnectionId,
          type: 'PARTNER_TASK_COMPLETED',
          title: 'Partner Completed a Task 🎉',
          message: `${userName} finished "${(data?.task?.title || 'a study task').split('—')[0].trim()}". Virtual hug unlocked 🫂`,
          category: 'partner',
          relatedEntityId: data?.taskId || data?.task?.id,
          relatedEntityType: 'Task',
        });
      }

      if (userId) {
        await recalculateAndBroadcastProgress(io, socket.currentRoom, userId, userName);
      }
    });

    // 3. Task Uncompleted
    socket.on('task_uncompleted', async (data) => {
      if (!socket.currentRoom) return;

      const payload = {
        taskId: data?.taskId || data?.task?.id,
        task: data?.task,
        userId: userId || socket.id,
        userName,
        timestamp: new Date().toISOString(),
      };

      socket.to(socket.currentRoom).emit('task_uncompleted', payload);
      socket.to(socket.currentRoom).emit('partner_task_uncompleted', payload);

      if (userId) {
        await recalculateAndBroadcastProgress(io, socket.currentRoom, userId, userName);
      }
    });

    // 4. Task Updated
    socket.on('task_updated', (data) => {
      if (!socket.currentRoom) return;

      const payload = {
        taskId: data?.taskId || data?.task?.id,
        task: data?.task || data?.updates,
        updates: data?.updates || data?.task,
        userId: userId || socket.id,
        userName,
        timestamp: new Date().toISOString(),
      };

      socket.to(socket.currentRoom).emit('task_updated', payload);
      socket.to(socket.currentRoom).emit('partner_task_updated', payload);
    });

    // 5. Task Deleted
    socket.on('task_deleted', async (data) => {
      if (!socket.currentRoom) return;

      const payload = {
        taskId: data?.taskId,
        userId: userId || socket.id,
        userName,
        timestamp: new Date().toISOString(),
      };

      socket.to(socket.currentRoom).emit('task_deleted', payload);
      socket.to(socket.currentRoom).emit('partner_task_deleted', payload);

      if (userId) {
        await recalculateAndBroadcastProgress(io, socket.currentRoom, userId, userName);
      }
    });

    // --- REAL-TIME WELLNESS & CHECK-IN EVENTS ---
    const handleCheckIn = (data) => {
      if (!socket.currentRoom) return;

      const payload = {
        userId: userId || socket.id,
        userName,
        mood: data?.mood,
        energyLevel: data?.energyLevel,
        reaction: data?.reaction,
        statusMessage: data?.statusMessage,
        timestamp: new Date().toISOString(),
      };

      socket.to(socket.currentRoom).emit('checkin_submitted', payload);
      socket.to(socket.currentRoom).emit('partner_checkin_updated', payload);

      if (!userId) {
        socket.to(socket.currentRoom).emit('notification_created', {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: 'Partner Checked In',
          text: `${userName} checked in: ${data?.reaction || '✨'} ${data?.mood ? `feeling ${data.mood}` : ''}`,
          type: 'checkin',
          timestamp: new Date().toISOString(),
          actor: 'partner',
        });
      }

      // Persist check-in partner notification
      if (userId) {
        createPartnerNotification({
          currentUserId: userId,
          partnerConnectionId: socket.partnerConnectionId,
          type: 'PARTNER_CHECKIN',
          title: 'Partner Checked In ✨',
          message: `${userName} checked in: ${data?.reaction || '✨'} ${data?.mood ? `feeling ${data.mood}` : ''}`,
          category: 'partner',
        });
      }
    };

    socket.on('checkin_submitted', handleCheckIn);
    socket.on('checkin_updated', handleCheckIn);

    // --- Micro-Encouragement & Cheers ---
    socket.on('send_cheer', (data) => {
      if (!socket.currentRoom) return;

      socket.to(socket.currentRoom).emit('partner_cheered', {
        userId: userId || socket.id,
        userName,
        reaction: data?.reaction || '💖',
        message: data?.message || 'High five! Keep going!',
        timestamp: new Date().toISOString(),
      });

      socket.to(socket.currentRoom).emit('notification_created', {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Encouragement Cheer',
        text: `${userName} sent a cheer: ${data?.reaction || '💖'}`,
        type: 'reaction',
        timestamp: new Date().toISOString(),
        actor: 'partner',
      });
    });

    // --- REAL-TIME STUDY SESSION SYNCHRONIZATION (STEP 5) ---

    // 1. Study Session Started
    socket.on('study_session_started', async (data) => {
      if (!socket.currentRoom) return;

      const mode = data?.mode || 'focus';
      const durationMins = Number(data?.durationMins) || 50;
      const subject = data?.subject || 'General Focus Target';
      const now = new Date();

      try {
        await PartnerConnection.findOneAndUpdate(
          { roomCode: socket.currentRoom },
          {
            activeSession: {
              status: 'active',
              mode,
              durationMins,
              startedAt: now,
              pausedAt: null,
              elapsedSeconds: 0,
              ownerId: userId || null,
              ownerName: userName,
              subject,
            },
          }
        );
      } catch (err) {
        console.warn('[Socket.IO Session] Error persisting started session:', err.message);
      }

      const sessionPayload = {
        status: 'active',
        mode,
        durationMins,
        startedAt: now.toISOString(),
        serverTime: now.toISOString(),
        ownerId: userId || socket.id,
        ownerName: userName,
        subject,
        timestamp: now.toISOString(),
      };

      // Broadcast to partner and caller for synchronized timer start
      socket.to(socket.currentRoom).emit('study_session_started', sessionPayload);
      socket.to(socket.currentRoom).emit('partner_study_session_started', sessionPayload);

      if (!userId) {
        // Partner notification fallback
        socket.to(socket.currentRoom).emit('notification_created', {
          id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          title: 'Study Session Started',
          text: `${userName} started a ${durationMins}m ${mode} session: "${subject}".`,
          type: 'session',
          timestamp: now.toISOString(),
          actor: 'partner',
        });
      }

      // Persist study session partner notification
      if (userId) {
        createPartnerNotification({
          currentUserId: userId,
          partnerConnectionId: socket.partnerConnectionId,
          type: 'STUDY_SESSION',
          title: 'Study Session Started ☕',
          message: `${userName} started a ${durationMins}m ${mode} session: "${subject}".`,
          category: 'study',
        });
      }
    });

    // 2. Study Session Updated (Pause / Resume / Preset Change)
    socket.on('study_session_updated', async (data) => {
      if (!socket.currentRoom) return;

      const action = data?.action || 'update';
      const now = new Date();
      let updatedSession = null;

      try {
        const connection = await PartnerConnection.findOne({ roomCode: socket.currentRoom });
        if (connection) {
          if (!connection.activeSession) {
            connection.activeSession = {
              status: 'idle',
              mode: 'focus',
              durationMins: 50,
              elapsedSeconds: 0,
            };
          }

          if (action === 'pause') {
            connection.activeSession.status = 'paused';
            connection.activeSession.pausedAt = now;
            connection.activeSession.elapsedSeconds = Number(data?.elapsedSeconds) || 0;
          } else if (action === 'resume') {
            connection.activeSession.status = 'active';
            connection.activeSession.pausedAt = null;
            const elapsed = Number(data?.elapsedSeconds) || connection.activeSession.elapsedSeconds || 0;
            connection.activeSession.startedAt = new Date(Date.now() - elapsed * 1000);
          } else if (action === 'preset') {
            connection.activeSession.mode = data?.mode || 'focus';
            connection.activeSession.durationMins = Number(data?.durationMins) || 50;
            connection.activeSession.status = 'idle';
            connection.activeSession.elapsedSeconds = 0;
            connection.activeSession.startedAt = null;
            connection.activeSession.pausedAt = null;
          }

          await connection.save();
          updatedSession = connection.activeSession;
        }
      } catch (err) {
        console.warn('[Socket.IO Session] Error updating session:', err.message);
      }

      const updatePayload = {
        action,
        status: updatedSession?.status || data?.status || 'active',
        mode: updatedSession?.mode || data?.mode || 'focus',
        durationMins: updatedSession?.durationMins || Number(data?.durationMins) || 50,
        startedAt: updatedSession?.startedAt?.toISOString() || data?.startedAt || null,
        pausedAt: updatedSession?.pausedAt?.toISOString() || data?.pausedAt || null,
        elapsedSeconds: updatedSession?.elapsedSeconds !== undefined ? updatedSession.elapsedSeconds : Number(data?.elapsedSeconds) || 0,
        serverTime: now.toISOString(),
        ownerName: userName,
        timestamp: now.toISOString(),
      };

      socket.to(socket.currentRoom).emit('study_session_updated', updatePayload);
      socket.to(socket.currentRoom).emit('partner_study_session_updated', updatePayload);
    });

    // 3. Study Session Ended
    socket.on('study_session_ended', async (data) => {
      if (!socket.currentRoom) return;

      const now = new Date();
      const elapsedSeconds = Number(data?.elapsedSeconds) || 0;
      const completedMinutes = Math.round(elapsedSeconds / 60);

      try {
        const activeConn = await PartnerConnection.findOneAndUpdate(
          { roomCode: socket.currentRoom },
          {
            activeSession: {
              status: 'ended',
              elapsedSeconds,
            },
          }
        );

        // If completed focus minutes, award progress to user and record StudySession
        if (userId && completedMinutes > 0) {
          await User.findByIdAndUpdate(userId, {
            $inc: { todayStudyMinutes: completedMinutes },
          });

          if (activeConn) {
            await StudySession.create({
              partnerConnectionId: activeConn._id,
              user: userId,
              userName: userName || 'Partner',
              mode: data?.mode || 'focus',
              durationMins: Number(data?.durationMins) || completedMinutes,
              completedMinutes,
              elapsedSeconds,
              subject: data?.subject || 'Focus Session',
              startedAt: new Date(Date.now() - elapsedSeconds * 1000),
              endedAt: now,
            });
          }
        }
      } catch (err) {
        console.warn('[Socket.IO Session] Error ending session:', err.message);
      }

      const endPayload = {
        status: data?.status || 'ended',
        elapsedSeconds,
        completedMinutes,
        endedBy: userName,
        timestamp: now.toISOString(),
      };

      socket.to(socket.currentRoom).emit('study_session_ended', endPayload);
      socket.to(socket.currentRoom).emit('partner_study_session_ended', endPayload);

      socket.to(socket.currentRoom).emit('notification_created', {
        id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: 'Study Session Ended',
        text: `${userName} completed a study session (${completedMinutes} mins).`,
        type: 'session',
        timestamp: now.toISOString(),
        actor: 'partner',
      });

      if (userId) {
        await recalculateAndBroadcastProgress(io, socket.currentRoom, userId, userName);
      }
    });

    // Analytics Updated Relay
    socket.on('analytics_updated', (data) => {
      if (!socket.currentRoom) return;
      io.to(socket.currentRoom).emit('analytics_updated', {
        userId,
        userName,
        timestamp: new Date().toISOString(),
        ...data,
      });
    });

    // 4. Custom Notification Created Relay
    socket.on('notification_created', (data) => {
      if (!socket.currentRoom || !data) return;
      const notifPayload = {
        ...data,
        timestamp: data.timestamp || new Date().toISOString(),
      };
      socket.to(socket.currentRoom).emit('notification_created', notifPayload);
      socket.to(socket.currentRoom).emit('partner_notification_created', notifPayload);
    });

    // Legacy timer action alias
    socket.on('timer_action', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('partner_timer_action', {
        userId: userId || socket.id,
        action: data?.action,
        mode: data?.mode,
        timeLeft: data?.timeLeft,
        timestamp: new Date().toISOString(),
      });
    });

    // --- STEP 6: TOMORROW PACT & DARE REAL-TIME SYNCHRONIZATION ---

    // 1. Pact Created
    socket.on('pact_created', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('pact_created', {
        ...data,
        userId: userId || socket.id,
        userName,
        timestamp: new Date().toISOString(),
      });
    });

    // 2. Pact Updated (commitment added, edited, deleted)
    socket.on('pact_updated', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('pact_updated', {
        ...data,
        userId: userId || socket.id,
        userName,
        timestamp: new Date().toISOString(),
      });
    });

    // 3. Pact Confirmed
    socket.on('pact_confirmed', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('pact_confirmed', {
        ...data,
        userId: userId || socket.id,
        userName,
        timestamp: new Date().toISOString(),
      });
    });

    // 4. Pact Finalized (Locked)
    socket.on('pact_finalized', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('pact_finalized', {
        ...data,
        status: 'locked',
        timestamp: new Date().toISOString(),
      });
    });

    // 5. Pact Activated (Next Day)
    socket.on('pact_activated', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('pact_activated', {
        ...data,
        status: 'active',
        timestamp: new Date().toISOString(),
      });
    });

    // 6. Pact Commitment Completed
    socket.on('pact_commitment_completed', async (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('pact_commitment_completed', {
        ...data,
        userId: userId || socket.id,
        userName,
        timestamp: new Date().toISOString(),
      });

      if (userId) {
        await recalculateAndBroadcastProgress(io, socket.currentRoom, userId, userName);
      }
    });

    // 7. Dare Created / Assigned
    socket.on('dare_created', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('dare_created', {
        ...data,
        proposedBy: userName,
        timestamp: new Date().toISOString(),
      });
    });

    // 8. Dare Updated (Accepted / Skipped)
    socket.on('dare_updated', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('dare_updated', {
        ...data,
        updatedBy: userName,
        timestamp: new Date().toISOString(),
      });
    });

    // 9. Dare Completed
    socket.on('dare_completed', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('dare_completed', {
        ...data,
        completedBy: userName,
        timestamp: new Date().toISOString(),
      });
    });

    // 10. Accountability Notification Relay
    socket.on('accountability_notification', (data) => {
      if (!socket.currentRoom || !data) return;
      socket.to(socket.currentRoom).emit('accountability_notification', {
        ...data,
        id: data.id || `notif-acc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
      });
    });

    // --- WebRTC Signaling & Call Lifecycle ---

    // 1. Initiate call to partner
    const handleCallUser = (data) => {
      if (!socket.currentRoom) {
        return socket.emit('error', { message: 'Cannot initiate call: not in a partner room.' });
      }

      console.log(`[Socket.IO WebRTC] Call initiated by ${userName} (${socket.id}) in ${socket.currentRoom}`);

      socket.to(socket.currentRoom).emit('incoming_call', {
        callerId: userId || socket.id,
        callerSocketId: socket.id,
        callerName: userName,
        callerAvatar: data?.callerAvatar,
        roomCode: socket.currentRoom,
        timestamp: new Date().toISOString(),
      });
    };

    socket.on('call_user', handleCallUser);
    socket.on('webrtc_call_user', handleCallUser);

    // 2. Accept incoming call
    socket.on('accept_call', () => {
      if (!socket.currentRoom) return;

      console.log(`[Socket.IO WebRTC] Call accepted by ${userName} in ${socket.currentRoom}`);

      socket.to(socket.currentRoom).emit('call_accepted', {
        calleeId: userId || socket.id,
        calleeSocketId: socket.id,
        calleeName: userName,
        roomCode: socket.currentRoom,
        timestamp: new Date().toISOString(),
      });
    });

    // 3. Reject incoming call
    socket.on('reject_call', (data) => {
      if (!socket.currentRoom) return;

      console.log(`[Socket.IO WebRTC] Call rejected by ${userName} (${data?.reason || 'declined'})`);

      socket.to(socket.currentRoom).emit('call_rejected', {
        reason: data?.reason || 'declined',
        calleeId: userId || socket.id,
        calleeName: userName,
        timestamp: new Date().toISOString(),
      });
    });

    // 4. End active call
    socket.on('end_call', (data) => {
      if (!socket.currentRoom) return;

      console.log(`[Socket.IO WebRTC] Call ended by ${userName} in ${socket.currentRoom}`);

      socket.to(socket.currentRoom).emit('call_ended', {
        endedBy: userId || socket.id,
        userName,
        reason: data?.reason || 'hangup',
        timestamp: new Date().toISOString(),
      });
    });

    // 5. Sync media track toggles (mic/cam on/off)
    socket.on('call_media_state', (data) => {
      if (!socket.currentRoom) return;

      socket.to(socket.currentRoom).emit('partner_media_state_changed', {
        userId: userId || socket.id,
        userName,
        micOn: data?.micOn !== undefined ? data.micOn : true,
        camOn: data?.camOn !== undefined ? data.camOn : true,
        timestamp: new Date().toISOString(),
      });
    });

    // 6. WebRTC SDP Offer
    socket.on('webrtc_offer', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('webrtc_offer', {
        offer: data?.offer,
        senderId: socket.id,
        senderUser: { userId, userName },
        timestamp: new Date().toISOString(),
      });
    });

    // 7. WebRTC SDP Answer
    socket.on('webrtc_answer', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('webrtc_answer', {
        answer: data?.answer,
        senderId: socket.id,
        timestamp: new Date().toISOString(),
      });
    });

    // 8. WebRTC ICE Candidate
    socket.on('webrtc_ice_candidate', (data) => {
      if (!socket.currentRoom) return;
      socket.to(socket.currentRoom).emit('webrtc_ice_candidate', {
        candidate: data?.candidate,
        senderId: socket.id,
      });
    });

    // --- Disconnection Handling ---
    socket.on('disconnect', async (reason) => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id} (${reason})`);

      // If call was active, inform partner room
      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('call_ended', {
          endedBy: userId || socket.id,
          userName,
          reason: 'disconnected',
          timestamp: new Date().toISOString(),
        });
      }

      if (userId && userSocketsMap.has(userId)) {
        const userSockets = userSocketsMap.get(userId);
        userSockets.delete(socket.id);

        // If no more open sockets remain for this user, mark offline in DB
        if (userSockets.size === 0) {
          userSocketsMap.delete(userId);

          try {
            await User.findByIdAndUpdate(userId, {
              isOnline: false,
              lastSeen: new Date(),
            });
          } catch (err) {
            console.warn('[Socket.IO] Could not update offline status in DB:', err.message);
          }

          if (socket.currentRoom) {
            socket.to(socket.currentRoom).emit('partner_status_changed', {
              userId,
              userName,
              isOnline: false,
              lastSeen: new Date().toISOString(),
            });
          }
        }
      }

      if (socket.currentRoom) {
        socket.to(socket.currentRoom).emit('partner_disconnected', {
          userId: userId || socket.id,
          userName,
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });
      }
    });
  });

  ioInstance = io;
  return io;
};

/**
 * Access the active Socket.IO server instance
 */
export const getIO = () => ioInstance;
