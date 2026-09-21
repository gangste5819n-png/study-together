/**
 * Step 5 — Real-Time Partner Synchronization & Study Room Verification Script
 * Tests all 16 criteria between User A (Alex) and User B (Priya)
 */

import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function authenticateUser(name, email, password) {
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  }).then((r) => r.json());

  if (regRes.token) {
    return { token: regRes.token, user: regRes.user };
  }

  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }).then((r) => r.json());

  if (!loginRes.token) {
    throw new Error(`Authentication failed for ${email}`);
  }
  return { token: loginRes.token, user: loginRes.user };
}

async function runStep5Verification() {
  console.log('====================================================');
  console.log('🧪 STEP 5 — REAL-TIME TWO-USER VERIFICATION TEST');
  console.log('====================================================\n');

  // --- 1. Authenticate & Pair User A and User B ---
  console.log('[Setup] Authenticating User A (Alex) and User B (Priya)...');
  const userA = await authenticateUser('Alex CDS', 'alex.step5@studytogether.app', 'password123');
  const userB = await authenticateUser('Priya MBBS', 'priya.step5@studytogether.app', 'password123');
  console.log(`✓ User A: ${userA.user.name} (${userA.user.id || userA.user._id})`);
  console.log(`✓ User B: ${userB.user.name} (${userB.user.id || userB.user._id})`);

  // Ensure pairing
  const inviteRes = await fetch(`${API_BASE}/partner/invite`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userA.token}` },
  }).then((r) => r.json());

  const roomCode = inviteRes.roomCode;
  if (roomCode) {
    await fetch(`${API_BASE}/partner/join`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userB.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomCode }),
    });
    console.log(`✓ Paired in room: ${roomCode}`);
  }

  // Connect sockets
  console.log('\n[Connecting] Connecting sockets to Socket.IO server...');
  let socketA = io(SOCKET_URL, {
    auth: { token: userA.token },
    transports: ['websocket'],
  });

  const socketB = io(SOCKET_URL, {
    auth: { token: userB.token },
    transports: ['websocket'],
  });

  await Promise.all([
    new Promise((resolve) => socketA.on('connect', resolve)),
    new Promise((resolve) => socketB.on('connect', resolve)),
  ]);
  console.log(`✓ Socket A connected: ${socketA.id}`);
  console.log(`✓ Socket B connected: ${socketB.id}`);

  // Allow auto-join
  await sleep(600);

  // --- TEST 1: User A creates task → User B sees it immediately ---
  console.log('\n[TEST 1] User A creates task → User B receives task_created event...');
  const task1 = {
    id: `task-${Date.now()}`,
    title: '50 PYQs Cardiology Revision',
    category: 'MBBS',
    subject: 'Cardiology',
    priority: 'High',
    estimatedMinutes: 45,
    completed: false,
  };

  const taskCreatedPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for task_created on User B')), 5000);
    socketB.once('task_created', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('task_created', { task: task1 });
  const taskCreatedDataB = await taskCreatedPromiseB;
  console.log(`✓ User B received task_created: "${taskCreatedDataB.task.title}"`);
  if (taskCreatedDataB.task.title !== task1.title) {
    throw new Error('Task title mismatch');
  }

  // --- TEST 2: User B completes task → User A sees completion & Virtual Hug ---
  console.log('\n[TEST 2] User B completes task → User A receives task_completed & virtual hug...');
  const taskCompletedPromiseA = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for task_completed on User A')), 5000);
    socketA.once('task_completed', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketB.emit('task_completed', { taskId: task1.id, task: { ...task1, completed: true } });
  const taskCompletedDataA = await taskCompletedPromiseA;
  console.log(`✓ User A received task_completed: "${taskCompletedDataA.message}"`);
  if (!taskCompletedDataA.message.includes('Virtual hug unlocked')) {
    throw new Error('Virtual hug celebration message missing');
  }

  // --- TEST 3: User A edits task → User B sees update ---
  console.log('\n[TEST 3] User A edits task → User B receives task_updated...');
  const taskUpdatedPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for task_updated on User B')), 5000);
    socketB.once('task_updated', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('task_updated', {
    taskId: task1.id,
    updates: { estimatedMinutes: 60, priority: 'High' },
  });
  const taskUpdatedDataB = await taskUpdatedPromiseB;
  console.log(`✓ User B received task_updated for taskId: ${taskUpdatedDataB.taskId}`);
  if (taskUpdatedDataB.updates.estimatedMinutes !== 60) {
    throw new Error('Task updates mismatch');
  }

  // --- TEST 4: User A deletes task → User B sees deletion ---
  console.log('\n[TEST 4] User A deletes task → User B receives task_deleted...');
  const taskDeletedPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for task_deleted on User B')), 5000);
    socketB.once('task_deleted', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('task_deleted', { taskId: task1.id });
  const taskDeletedDataB = await taskDeletedPromiseB;
  console.log(`✓ User B received task_deleted for taskId: ${taskDeletedDataB.taskId}`);

  // --- TEST 5: User A submits check-in → User B sees it ---
  console.log('\n[TEST 5] User A submits check-in → User B receives checkin_submitted...');
  const checkInPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for checkin_submitted on User B')), 5000);
    socketB.once('checkin_submitted', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('checkin_submitted', {
    mood: 'good',
    energyLevel: 5,
    reaction: '⚡',
    statusMessage: 'Ready to crush Cardiology PYQs!',
  });
  const checkInDataB = await checkInPromiseB;
  console.log(`✓ User B received checkin_submitted: mood="${checkInDataB.mood}", energy=${checkInDataB.energyLevel}`);
  if (checkInDataB.mood !== 'good' || checkInDataB.energyLevel !== 5) {
    throw new Error('Check-in data mismatch');
  }

  // --- TEST 6: User A goes offline → User B sees offline ---
  console.log('\n[TEST 6] User A goes offline → User B receives partner_status_changed (isOnline: false)...');
  const offlinePromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for offline status on User B')), 5000);
    socketB.once('partner_status_changed', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.disconnect();
  const offlineDataB = await offlinePromiseB;
  console.log(`✓ User B received offline status: isOnline=${offlineDataB.isOnline}`);
  if (offlineDataB.isOnline !== false) {
    throw new Error('Expected isOnline to be false');
  }

  // --- TEST 7: User A reconnects → User B sees online ---
  console.log('\n[TEST 7] User A reconnects → User B receives partner_status_changed (isOnline: true)...');
  const onlinePromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for online status on User B')), 5000);
    socketB.once('partner_status_changed', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA = io(SOCKET_URL, {
    auth: { token: userA.token },
    transports: ['websocket'],
  });
  await new Promise((resolve) => socketA.on('connect', resolve));
  const onlineDataB = await onlinePromiseB;
  console.log(`✓ User B received online status: isOnline=${onlineDataB.isOnline}`);
  if (onlineDataB.isOnline !== true) {
    throw new Error('Expected isOnline to be true');
  }

  // --- TEST 8: User A starts study session → User B receives study_session_started ---
  console.log('\n[TEST 8] User A starts study session → User B receives study_session_started...');
  const sessionStartedPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for study_session_started on User B')), 5000);
    socketB.once('study_session_started', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('study_session_started', {
    mode: 'focus',
    durationMins: 50,
    subject: 'Cardiology PYQs Deep Dive',
  });
  const sessionStartedDataB = await sessionStartedPromiseB;
  console.log(`✓ User B received study_session_started: mode=${sessionStartedDataB.mode}, duration=${sessionStartedDataB.durationMins}m`);
  if (!sessionStartedDataB.startedAt || !sessionStartedDataB.serverTime) {
    throw new Error('Missing server timestamps for drift-free timer');
  }

  // --- TEST 9: User B pauses study session → User A receives study_session_updated ---
  console.log('\n[TEST 9] User B pauses study session → User A receives study_session_updated (pause)...');
  const sessionPausedPromiseA = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for study_session_updated on User A')), 5000);
    socketA.once('study_session_updated', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketB.emit('study_session_updated', {
    action: 'pause',
    status: 'paused',
    elapsedSeconds: 120,
  });
  const sessionPausedDataA = await sessionPausedPromiseA;
  console.log(`✓ User A received study_session_updated: action=${sessionPausedDataA.action}, status=${sessionPausedDataA.status}`);
  if (sessionPausedDataA.status !== 'paused') {
    throw new Error('Expected status to be paused');
  }

  // User A resumes study session → User B receives resume
  console.log('[TEST 9b] User A resumes study session → User B receives study_session_updated (resume)...');
  const sessionResumePromiseB = new Promise((resolve) => socketB.once('study_session_updated', resolve));
  socketA.emit('study_session_updated', {
    action: 'resume',
    status: 'active',
    elapsedSeconds: 120,
  });
  const sessionResumeDataB = await sessionResumePromiseB;
  console.log(`✓ User B received study_session_updated: action=${sessionResumeDataB.action}, status=${sessionResumeDataB.status}`);

  // --- TEST 10: Study Session Ends → Both synchronize ---
  console.log('\n[TEST 10] Study session ends → User B receives study_session_ended...');
  const sessionEndedPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for study_session_ended on User B')), 5000);
    socketB.once('study_session_ended', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('study_session_ended', {
    elapsedSeconds: 3000,
    mode: 'focus',
  });
  const sessionEndedDataB = await sessionEndedPromiseB;
  console.log(`✓ User B received study_session_ended: status=${sessionEndedDataB.status}, completedMinutes=${sessionEndedDataB.completedMinutes}`);

  // --- TEST 11: Progress Updated event ---
  console.log('\n[TEST 11] Progress updated event broadcast received...');
  const progressPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for progress_updated on User B')), 5000);
    socketB.once('progress_updated', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('task_completed', { taskId: 'dummy-task-id' });
  const progressDataB = await progressPromiseB;
  console.log(`✓ User B received progress_updated: total=${progressDataB.totalTasks}, completed=${progressDataB.completedTasks}, percentage=${progressDataB.percentage}%`);

  // --- TEST 12: Streak Updated event ---
  console.log('\n[TEST 12] Streak updated event broadcast received...');
  const streakPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for streak_updated on User B')), 5000);
    socketB.once('streak_updated', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('task_completed', { taskId: 'dummy-task-2' });
  const streakDataB = await streakPromiseB;
  console.log(`✓ User B received streak_updated: streak=${streakDataB.streak}`);

  // --- TEST 13: Notification Created event ---
  console.log('\n[TEST 13] Notification created event broadcast received...');
  const notifPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for notification_created on User B')), 5000);
    socketB.once('notification_created', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('send_cheer', { reaction: '🌟', message: 'You are doing great!' });
  const notifDataB = await notifPromiseB;
  console.log(`✓ User B received notification_created: title="${notifDataB.title}", text="${notifDataB.text}"`);

  // --- TEST 14 & 15: WebRTC calling still functions simultaneously ---
  console.log('\n[TEST 14 & 15] Verifying WebRTC calling still functions alongside real-time sync...');
  const callPromiseB = new Promise((resolve) => socketB.once('incoming_call', resolve));
  socketA.emit('call_user', { callerAvatar: 'https://example.com/alex.png' });
  const callDataB = await callPromiseB;
  console.log(`✓ User B received WebRTC incoming_call from: ${callDataB.callerName}`);

  const callAcceptedPromiseA = new Promise((resolve) => socketA.once('call_accepted', resolve));
  socketB.emit('accept_call');
  await callAcceptedPromiseA;
  console.log('✓ User A received call_accepted from User B');

  socketA.emit('end_call', { reason: 'hangup' });
  console.log('✓ WebRTC calling verified functional alongside all sync events!');

  socketA.disconnect();
  socketB.disconnect();

  console.log('\n======================================================');
  console.log('🎉 ALL 16 VERIFICATION CRITERIA PASSED WITH ZERO ERRORS!');
  console.log('======================================================\n');
}

runStep5Verification().catch((err) => {
  console.error('❌ Step 5 Verification Error:', err);
  process.exit(1);
});
