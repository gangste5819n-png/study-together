/**
 * WebRTC Peer Connection and Media Service
 * Manages native browser RTCPeerConnection, getUserMedia permissions,
 * audio/video track lifecycle, STUN/TURN configuration, and ICE candidate exchange.
 */

export interface WebRTCServiceCallbacks {
  onRemoteStream: (stream: MediaStream) => void;
  onIceCandidate: (candidate: RTCIceCandidateInit) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onIceConnectionStateChange?: (state: RTCIceConnectionState) => void;
}

export interface MediaPermissionResult {
  stream: MediaStream | null;
  hasVideo: boolean;
  hasAudio: boolean;
  error?: string;
  isPermissionDenied?: boolean;
}

/**
 * Standard ICE Servers Configuration
 * Google STUN servers for robust NAT traversal in dev/testing,
 * with hook for future production TURN server via environment variables.
 */
export const getIceServers = (): RTCConfiguration => {
  const iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ];

  const turnUrl = import.meta.env.VITE_TURN_SERVER_URL;
  const turnUsername = import.meta.env.VITE_TURN_USERNAME;
  const turnCredential = import.meta.env.VITE_TURN_CREDENTIAL;

  if (turnUrl) {
    iceServers.push({
      urls: turnUrl,
      username: turnUsername,
      credential: turnCredential,
    });
  }

  return {
    iceServers,
    iceCandidatePoolSize: 10,
  };
};

export class WebRTCService {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private iceCandidatesQueue: RTCIceCandidateInit[] = [];
  private isRemoteDescriptionSet: boolean = false;

  /**
   * Request local camera and microphone media stream
   * Gracefully handles permission denial or missing video device
   */
  public async getLocalMedia(videoWanted: boolean = true, audioWanted: boolean = true): Promise<MediaPermissionResult> {
    // If existing local stream has active tracks, return it
    if (this.localStream && this.localStream.active && this.localStream.getTracks().length > 0) {
      return {
        stream: this.localStream,
        hasVideo: this.localStream.getVideoTracks().some((t) => t.enabled),
        hasAudio: this.localStream.getAudioTracks().some((t) => t.enabled),
      };
    }

    // Safety check for browser support
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      return {
        stream: null,
        hasVideo: false,
        hasAudio: false,
        error: 'WebRTC getUserMedia is not supported in this browser environment.',
      };
    }

    try {
      // 1. Attempt requesting audio & video
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoWanted
          ? {
              width: { ideal: 1280 },
              height: { ideal: 720 },
              facingMode: 'user',
            }
          : false,
        audio: audioWanted
          ? {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true,
            }
          : false,
      });

      this.localStream = stream;
      return {
        stream,
        hasVideo: stream.getVideoTracks().length > 0,
        hasAudio: stream.getAudioTracks().length > 0,
      };
    } catch (err: any) {
      console.warn('[WebRTCService] Primary media request notice:', err.name, err.message);

      // If user denied access explicitly
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        return {
          stream: null,
          hasVideo: false,
          hasAudio: false,
          isPermissionDenied: true,
          error: 'Camera/Microphone permission was denied in your browser. Please allow permissions in your address bar and retry.',
        };
      }

      // If video device failed (e.g., no webcam plugged in), attempt audio-only fallback
      if (videoWanted && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || err.name === 'OverconstrainedError')) {
        try {
          console.log('[WebRTCService] Attempting audio-only fallback...');
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
            },
          });

          this.localStream = audioOnlyStream;
          return {
            stream: audioOnlyStream,
            hasVideo: false,
            hasAudio: true,
            error: 'Camera device not detected. Connected using audio only.',
          };
        } catch (audioErr: any) {
          return {
            stream: null,
            hasVideo: false,
            hasAudio: false,
            error: `Audio device error: ${audioErr.message || 'Could not access audio device.'}`,
          };
        }
      }

      return {
        stream: null,
        hasVideo: false,
        hasAudio: false,
        error: err.message || 'Could not acquire local camera or microphone.',
      };
    }
  }

  /**
   * Initialize RTCPeerConnection with STUN servers and event callbacks
   */
  public initializePeerConnection(callbacks: WebRTCServiceCallbacks): RTCPeerConnection {
    this.cleanupPeerConnection();

    this.isRemoteDescriptionSet = false;
    this.iceCandidatesQueue = [];

    const config = getIceServers();
    const pc = new RTCPeerConnection(config);
    this.peerConnection = pc;

    // Attach local tracks if stream is ready
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle inbound remote tracks
    pc.ontrack = (event: RTCTrackEvent) => {
      console.log('[WebRTCService] Remote track received:', event.track.kind);
      if (event.streams && event.streams[0]) {
        this.remoteStream = event.streams[0];
        callbacks.onRemoteStream(event.streams[0]);
      } else {
        // Fallback for browsers that don't package track in stream
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        this.remoteStream.addTrack(event.track);
        callbacks.onRemoteStream(this.remoteStream);
      }
    };

    // Handle local ICE candidates to be sent across signaling
    pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        callbacks.onIceCandidate(event.candidate.toJSON());
      }
    };

    // Track connection state changes
    pc.onconnectionstatechange = () => {
      console.log('[WebRTCService] Peer connection state:', pc.connectionState);
      callbacks.onConnectionStateChange(pc.connectionState);
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTCService] ICE connection state:', pc.iceConnectionState);
      if (callbacks.onIceConnectionStateChange) {
        callbacks.onIceConnectionStateChange(pc.iceConnectionState);
      }
    };

    return pc;
  }

  /**
   * Create SDP Offer (Caller side)
   */
  public async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not initialized before creating offer.');
    }

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });

    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  /**
   * Handle SDP Offer and Create SDP Answer (Callee side)
   */
  public async handleOfferAndCreateAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not initialized before handling offer.');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    this.isRemoteDescriptionSet = true;
    await this.processBufferedIceCandidates();

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  /**
   * Handle SDP Answer from Callee (Caller side)
   */
  public async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not initialized before handling answer.');
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
    this.isRemoteDescriptionSet = true;
    await this.processBufferedIceCandidates();
  }

  /**
   * Add ICE candidate received from signaling partner
   * Buffers candidate if remote description is not yet set
   */
  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection || !this.isRemoteDescriptionSet) {
      // Buffer until remote description is settled
      this.iceCandidatesQueue.push(candidate);
      return;
    }

    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.warn('[WebRTCService] Error adding ICE candidate:', err);
    }
  }

  /**
   * Process any ICE candidates that arrived before remote description was set
   */
  private async processBufferedIceCandidates(): Promise<void> {
    if (!this.peerConnection || !this.isRemoteDescriptionSet) return;

    while (this.iceCandidatesQueue.length > 0) {
      const candidate = this.iceCandidatesQueue.shift();
      if (candidate) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn('[WebRTCService] Error adding buffered ICE candidate:', err);
        }
      }
    }
  }

  /**
   * Toggle microphone audio track on/off
   */
  public setMicEnabled(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Toggle camera video track on/off
   */
  public setCamEnabled(enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach((track) => {
        track.enabled = enabled;
      });
    }
  }

  /**
   * Get active local stream
   */
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  /**
   * Get active remote stream
   */
  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  /**
   * Release camera and microphone hardware tracks
   */
  public stopLocalStream(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (err) {
          console.warn('[WebRTCService] Error stopping track:', err);
        }
      });
      this.localStream = null;
    }
  }

  /**
   * Close and dispose RTCPeerConnection
   */
  public cleanupPeerConnection(): void {
    if (this.peerConnection) {
      try {
        this.peerConnection.ontrack = null;
        this.peerConnection.onicecandidate = null;
        this.peerConnection.onconnectionstatechange = null;
        this.peerConnection.oniceconnectionstatechange = null;
        this.peerConnection.close();
      } catch (err) {
        console.warn('[WebRTCService] Error closing peer connection:', err);
      }
      this.peerConnection = null;
    }
    this.remoteStream = null;
    this.isRemoteDescriptionSet = false;
    this.iceCandidatesQueue = [];
  }

  /**
   * Complete call cleanup: stop hardware, close connection, reset state
   */
  public cleanup(): void {
    this.stopLocalStream();
    this.cleanupPeerConnection();
  }
}

// Export singleton instance
export const webrtcService = new WebRTCService();
