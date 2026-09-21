import React, { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  webrtcService,
  type MediaPermissionResult,
} from '../services/webrtcService';
import {
  emitCallUser,
  emitAcceptCall,
  emitRejectCall,
  emitEndCall,
  emitCallMediaState,
  emitWebRtcOffer,
  emitWebRtcAnswer,
  emitWebRtcIceCandidate,
  onIncomingCall,
  onCallAccepted,
  onCallRejected,
  onCallEnded,
  onPartnerMediaStateChanged,
  onWebRtcOffer,
  onWebRtcAnswer,
  onWebRtcIceCandidate,
  type IncomingCallPayload,
} from '../services/socketService';
import { useStudy } from './StudyContext';

export type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended';

export interface CallerInfo {
  userId: string;
  name: string;
  avatar?: string;
  roomCode: string;
}

interface CallContextType {
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  caller: CallerInfo | null;
  isMicOn: boolean;
  isCamOn: boolean;
  partnerMicOn: boolean;
  partnerCamOn: boolean;
  callDuration: number;
  connectionQuality: 'connecting' | 'connected' | 'disconnected' | 'failed';
  permissionError: string | null;
  isPermissionDenied: boolean;
  startCall: () => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: (reason?: string) => void;
  endCall: () => void;
  toggleMic: () => void;
  toggleCam: () => void;
  retryPermissions: () => Promise<void>;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export const CallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { me, partner, showToast } = useStudy();

  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [caller, setCaller] = useState<CallerInfo | null>(null);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [isCamOn, setIsCamOn] = useState<boolean>(true);
  const [partnerMicOn, setPartnerMicOn] = useState<boolean>(true);
  const [partnerCamOn, setPartnerCamOn] = useState<boolean>(true);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [connectionQuality, setConnectionQuality] = useState<
    'connecting' | 'connected' | 'disconnected' | 'failed'
  >('connecting');
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isPermissionDenied, setIsPermissionDenied] = useState<boolean>(false);

  // Refs for tracking state inside socket event listeners
  const callStateRef = useRef<CallState>('idle');
  useEffect(() => {
    callStateRef.current = callState;
  }, [callState]);

  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
  const timerRef = useRef<number | null>(null);

  // Call duration counter
  useEffect(() => {
    if (callState === 'connected') {
      timerRef.current = window.setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [callState]);

  // Clean up on tab close or refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (callStateRef.current !== 'idle') {
        emitEndCall('unloaded');
        webrtcService.cleanup();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Initialize peer connection helper
  const setupPeerConnection = useCallback(() => {
    return webrtcService.initializePeerConnection({
      onRemoteStream: (stream) => {
        console.log('[CallContext] Remote stream received, tracks:', stream.getTracks().length);
        setRemoteStream(stream);
      },
      onIceCandidate: (candidate) => {
        emitWebRtcIceCandidate(candidate);
      },
      onConnectionStateChange: (state) => {
        console.log('[CallContext] Connection state:', state);
        if (state === 'connected') {
          setConnectionQuality('connected');
        } else if (state === 'connecting') {
          setConnectionQuality('connecting');
        } else if (state === 'disconnected') {
          setConnectionQuality('disconnected');
        } else if (state === 'failed') {
          setConnectionQuality('failed');
          showToast('Call connection encountered an issue. Reconnecting...');
        }
      },
    });
  }, [showToast]);

  // --- Socket.IO Signaling Listeners ---
  useEffect(() => {
    // 1. Incoming Call
    const unsubIncoming = onIncomingCall((payload: IncomingCallPayload) => {
      console.log('[CallContext] Incoming call from:', payload.callerName);
      if (callStateRef.current !== 'idle') {
        // Already on a call, auto-reject with busy
        emitRejectCall('busy');
        return;
      }

      setCaller({
        userId: payload.callerId,
        name: payload.callerName,
        avatar: payload.callerAvatar,
        roomCode: payload.roomCode,
      });
      setCallState('incoming');
    });

    // 2. Call Accepted by Callee (Caller receives this)
    const unsubAccepted = onCallAccepted(async (payload) => {
      console.log('[CallContext] Call accepted by:', payload.calleeName);
      setCallState('connected');
      setConnectionQuality('connecting');
      showToast(`${payload.calleeName} joined the study call! 🎥`);

      try {
        // Create WebRTC Offer
        const offer = await webrtcService.createOffer();
        emitWebRtcOffer(offer);
      } catch (err: any) {
        console.error('[CallContext] Failed to create offer:', err);
        showToast('Failed to establish WebRTC media connection.');
      }
    });

    // 3. Call Rejected
    const unsubRejected = onCallRejected((payload) => {
      console.log('[CallContext] Call rejected:', payload.reason);
      const reasonMsg =
        payload.reason === 'busy'
          ? `${payload.calleeName} is currently busy.`
          : `${payload.calleeName} is unable to take the call right now.`;
      showToast(reasonMsg);

      webrtcService.cleanup();
      setLocalStream(null);
      setRemoteStream(null);
      setCallState('idle');
      setCaller(null);
    });

    // 4. Call Ended
    const unsubEnded = onCallEnded((payload) => {
      console.log('[CallContext] Call ended by partner:', payload.reason);
      showToast('Study call ended.');

      webrtcService.cleanup();
      setLocalStream(null);
      setRemoteStream(null);
      setCallState('idle');
      setCaller(null);
    });

    // 5. Partner Mic/Camera State Changes
    const unsubMediaState = onPartnerMediaStateChanged((payload) => {
      setPartnerMicOn(payload.micOn);
      setPartnerCamOn(payload.camOn);
    });

    // 6. WebRTC Offer (Callee receives this from Caller)
    const unsubOffer = onWebRtcOffer(async (payload) => {
      console.log('[CallContext] Received WebRTC offer');
      try {
        if (!webrtcService.getLocalStream()) {
          // If local media isn't ready yet, buffer offer
          pendingOfferRef.current = payload.offer;
          return;
        }

        setupPeerConnection();
        const answer = await webrtcService.handleOfferAndCreateAnswer(payload.offer);
        emitWebRtcAnswer(answer);
      } catch (err: any) {
        console.error('[CallContext] Error handling offer:', err);
      }
    });

    // 7. WebRTC Answer (Caller receives this from Callee)
    const unsubAnswer = onWebRtcAnswer(async (payload) => {
      console.log('[CallContext] Received WebRTC answer');
      try {
        await webrtcService.handleAnswer(payload.answer);
      } catch (err: any) {
        console.error('[CallContext] Error handling answer:', err);
      }
    });

    // 8. WebRTC ICE Candidate
    const unsubIce = onWebRtcIceCandidate(async (payload) => {
      try {
        await webrtcService.addIceCandidate(payload.candidate);
      } catch (err: any) {
        console.warn('[CallContext] Error adding candidate:', err);
      }
    });

    return () => {
      unsubIncoming();
      unsubAccepted();
      unsubRejected();
      unsubEnded();
      unsubMediaState();
      unsubOffer();
      unsubAnswer();
      unsubIce();
    };
  }, [showToast, setupPeerConnection]);

  // --- Start Call (Outgoing) ---
  const startCall = async () => {
    setPermissionError(null);
    setIsPermissionDenied(false);

    // Request local camera and microphone
    const mediaResult: MediaPermissionResult = await webrtcService.getLocalMedia(true, true);

    if (mediaResult.error && !mediaResult.stream) {
      setPermissionError(mediaResult.error);
      setIsPermissionDenied(Boolean(mediaResult.isPermissionDenied));
      showToast(mediaResult.error);
      return;
    }

    if (mediaResult.stream) {
      setLocalStream(mediaResult.stream);
      setIsMicOn(mediaResult.hasAudio);
      setIsCamOn(mediaResult.hasVideo);
    }

    // Initialize peer connection with tracks ready
    setupPeerConnection();

    // Update state to calling
    setCallState('calling');
    showToast(`Calling ${partner.name}... 📞`);

    // Emit signaling initiation to partner room
    emitCallUser({ callerAvatar: me.avatar });
  };

  // --- Accept Call (Incoming) ---
  const acceptCall = async () => {
    setPermissionError(null);
    setIsPermissionDenied(false);

    // Navigate immediately to Study Room for full-screen call experience
    navigate('/study-room');

    // Request local media
    const mediaResult = await webrtcService.getLocalMedia(true, true);
    if (mediaResult.error && !mediaResult.stream) {
      setPermissionError(mediaResult.error);
      setIsPermissionDenied(Boolean(mediaResult.isPermissionDenied));
      showToast(mediaResult.error);
      // Still reject if no media can be acquired
      rejectCall('Permission denied');
      return;
    }

    if (mediaResult.stream) {
      setLocalStream(mediaResult.stream);
      setIsMicOn(mediaResult.hasAudio);
      setIsCamOn(mediaResult.hasVideo);
    }

    setupPeerConnection();
    setCallState('connected');
    setConnectionQuality('connecting');

    // Inform caller that call was accepted
    emitAcceptCall();

    // If offer arrived before accepting, process it now
    if (pendingOfferRef.current) {
      try {
        const answer = await webrtcService.handleOfferAndCreateAnswer(pendingOfferRef.current);
        emitWebRtcAnswer(answer);
        pendingOfferRef.current = null;
      } catch (err: any) {
        console.error('[CallContext] Error handling pending offer:', err);
      }
    }
  };

  // --- Reject Call ---
  const rejectCall = (reason: string = 'declined') => {
    emitRejectCall(reason);
    webrtcService.cleanup();
    setCallState('idle');
    setCaller(null);
  };

  // --- End Active Call ---
  const endCall = () => {
    emitEndCall('hangup');
    webrtcService.cleanup();
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
    setCaller(null);
    setCallDuration(0);
    showToast('Call ended.');
  };

  // --- Toggle Microphone ---
  const toggleMic = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    webrtcService.setMicEnabled(nextState);
    emitCallMediaState({ micOn: nextState, camOn: isCamOn });
  };

  // --- Toggle Camera ---
  const toggleCam = () => {
    const nextState = !isCamOn;
    setIsCamOn(nextState);
    webrtcService.setCamEnabled(nextState);
    emitCallMediaState({ micOn: isMicOn, camOn: nextState });
  };

  // --- Retry Permissions ---
  const retryPermissions = async () => {
    setPermissionError(null);
    setIsPermissionDenied(false);

    const mediaResult = await webrtcService.getLocalMedia(true, true);
    if (mediaResult.stream) {
      setLocalStream(mediaResult.stream);
      setIsMicOn(mediaResult.hasAudio);
      setIsCamOn(mediaResult.hasVideo);
      showToast('Camera and microphone connected successfully! 🎉');
    } else if (mediaResult.error) {
      setPermissionError(mediaResult.error);
      setIsPermissionDenied(Boolean(mediaResult.isPermissionDenied));
    }
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        localStream,
        remoteStream,
        caller,
        isMicOn,
        isCamOn,
        partnerMicOn,
        partnerCamOn,
        callDuration,
        connectionQuality,
        permissionError,
        isPermissionDenied,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMic,
        toggleCam,
        retryPermissions,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = (): CallContextType => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
};
