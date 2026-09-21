/**
 * Test Step 4 WebRTC Signaling & Call Lifecycle
 * Verifies bidirectional Socket.IO signaling, offer/answer SDP exchange,
 * ICE candidates exchange, media toggling, call termination, and unexpected disconnect cleanup.
 */

import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

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
    throw new Error(`Authentication failed for ${email}: ${loginRes.message || JSON.stringify(loginRes)}`);
  }
  return { token: loginRes.token, user: loginRes.user };
}

async function runWebRTCTest() {
  console.log('=== STARTING STEP 4 WEBRTC SIGNALING VERIFICATION ===\n');

  // TEST 1: Authenticate both users
  console.log('[TEST 1] Logging in User A (Alex) and User B (Priya)...');
  const userA = await authenticateUser('Alex CDS', 'alex.realtime@studytogether.app', 'password123');
  const userB = await authenticateUser('Priya MBBS', 'priya.realtime@studytogether.app', 'password123');
  console.log(`✓ User A authenticated: ${userA.user.name} (${userA.user.id || userA.user._id})`);
  console.log(`✓ User B authenticated: ${userB.user.name} (${userB.user.id || userB.user._id})`);

  // Ensure pairing
  const inviteRes = await fetch(`${API_BASE}/partner/invite`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userA.token}` },
  }).then((r) => r.json());

  if (inviteRes.roomCode) {
    await fetch(`${API_BASE}/partner/join`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${userB.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomCode: inviteRes.roomCode }),
    });
    console.log(`✓ Paired in room: ${inviteRes.roomCode}`);
  }


  // Connect sockets with auth tokens
  console.log('\n[CONNECTING] Connecting sockets to Socket.IO server...');
  const socketA = io(SOCKET_URL, {
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

  // Auto-joined room verification
  await new Promise((r) => setTimeout(r, 600));

  // TEST 2 & 3: User A starts call -> User B receives incoming_call
  console.log('\n[TEST 2 & 3] User A initiates video call -> User B receives incoming_call');
  const incomingCallPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for incoming_call on User B')), 5000);
    socketB.once('incoming_call', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('call_user', { callerAvatar: 'https://example.com/alex.png' });
  const incomingCallData = await incomingCallPromise;
  console.log('✓ User B received incoming_call from:', incomingCallData.callerName);
  if (!incomingCallData.callerName.includes('Alex')) {
    throw new Error(`Expected callerName Alex, got ${incomingCallData.callerName}`);
  }

  // TEST 4: User B accepts call -> User A receives call_accepted
  console.log('\n[TEST 4] User B accepts call -> User A receives call_accepted');
  const callAcceptedPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for call_accepted on User A')), 5000);
    socketA.once('call_accepted', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketB.emit('accept_call');
  const callAcceptedData = await callAcceptedPromise;
  console.log('✓ User A received call_accepted from:', callAcceptedData.calleeName);
  if (!callAcceptedData.calleeName.includes('Priya')) {
    throw new Error(`Expected calleeName Priya, got ${callAcceptedData.calleeName}`);
  }

  // TEST 5: Bidirectional WebRTC SDP Offer / Answer & ICE Candidates Exchange
  console.log('\n[TEST 5] WebRTC Offer/Answer and ICE Candidates negotiation...');
  const offerPayload = {
    type: 'offer',
    sdp: 'v=0\r\no=- 42 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n',
  };

  const receiveOfferPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for webrtc_offer on User B')), 5000);
    socketB.once('webrtc_offer', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('webrtc_offer', { offer: offerPayload });
  await receiveOfferPromise;
  console.log('✓ User B received WebRTC offer from User A');

  const answerPayload = {
    type: 'answer',
    sdp: 'v=0\r\no=- 43 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96\r\n',
  };

  const receiveAnswerPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for webrtc_answer on User A')), 5000);
    socketA.once('webrtc_answer', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketB.emit('webrtc_answer', { answer: answerPayload });
  await receiveAnswerPromise;
  console.log('✓ User A received WebRTC answer from User B');

  // ICE Candidates exchange
  const iceCandidatePayloadA = {
    candidate: 'candidate:842163049 1 udp 1677729535 192.168.1.100 56123 typ srflx raddr 10.0.0.1 rport 56123',
    sdpMid: '0',
    sdpMLineIndex: 0,
  };

  const receiveIcePromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for ICE candidate on User B')), 5000);
    socketB.once('webrtc_ice_candidate', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('webrtc_ice_candidate', { candidate: iceCandidatePayloadA });
  await receiveIcePromiseB;
  console.log('✓ User B received ICE candidate from User A');

  // TEST 6: Microphone toggle sync
  console.log('\n[TEST 6] Toggle microphone: User A mutes mic -> User B notified');
  const mediaStatePromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for media state on User B')), 5000);
    socketB.once('partner_media_state_changed', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('call_media_state', { micOn: false, camOn: true });
  const mediaStateB = await mediaStatePromiseB;
  console.log(`✓ User B received media update: micOn=${mediaStateB.micOn}, camOn=${mediaStateB.camOn}`);
  if (mediaStateB.micOn !== false) throw new Error('Expected micOn to be false');

  // TEST 7: Camera toggle sync
  console.log('\n[TEST 7] Toggle camera: User B turns camera off -> User A notified');
  const mediaStatePromiseA = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for media state on User A')), 5000);
    socketA.once('partner_media_state_changed', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketB.emit('call_media_state', { micOn: true, camOn: false });
  const mediaStateA = await mediaStatePromiseA;
  console.log(`✓ User A received media update: micOn=${mediaStateA.micOn}, camOn=${mediaStateA.camOn}`);
  if (mediaStateA.camOn !== false) throw new Error('Expected camOn to be false');

  // TEST 8: End call from User A -> User B cleans up
  console.log('\n[TEST 8] End call from User A -> User B receives call_ended');
  const callEndedPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for call_ended on User B')), 5000);
    socketB.once('call_ended', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.emit('end_call', { reason: 'hangup' });
  const callEndedB = await callEndedPromiseB;
  console.log('✓ User B received call_ended with reason:', callEndedB.reason);

  // TEST 9: User B starts call, User A accepts, User B ends call
  console.log('\n[TEST 9] Reverse call flow: User B calls User A -> User A accepts -> User B ends');
  const incomingCallPromiseA = new Promise((resolve) => socketA.once('incoming_call', resolve));
  socketB.emit('call_user', { callerAvatar: 'https://example.com/priya.png' });
  await incomingCallPromiseA;
  console.log('✓ User A received incoming call from User B');

  const callAcceptedPromiseB = new Promise((resolve) => socketB.once('call_accepted', resolve));
  socketA.emit('accept_call');
  await callAcceptedPromiseB;
  console.log('✓ User B received call_accepted from User A');

  const callEndedPromiseA = new Promise((resolve) => socketA.once('call_ended', resolve));
  socketB.emit('end_call', { reason: 'hangup' });
  await callEndedPromiseA;
  console.log('✓ User A received call_ended from User B');

  // TEST 10: Unexpected disconnect during call -> Partner cleans up
  console.log('\n[TEST 10] Unexpected disconnect: Call active, User A abruptly disconnects');
  // Start call
  const callBPromise = new Promise((resolve) => socketB.once('incoming_call', resolve));
  socketA.emit('call_user');
  await callBPromise;

  const acceptedPromise = new Promise((resolve) => socketA.once('call_accepted', resolve));
  socketB.emit('accept_call');
  await acceptedPromise;
  console.log('✓ Call connected again');

  // Now User A disconnects unexpectedly
  const disconnectEndedPromiseB = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for disconnect cleanup on User B')), 5000);
    socketB.once('call_ended', (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

  socketA.disconnect();
  const disconnectResult = await disconnectEndedPromiseB;
  console.log('✓ User B successfully notified of unexpected disconnection:', disconnectResult.reason);

  socketB.disconnect();

  console.log('\n======================================================');
  console.log('🎉 ALL 10 TESTS PASSED SUCCESSFULLY! WEBRTC SIGNALING FULLY OPERATIONAL');
  console.log('======================================================\n');
}

runWebRTCTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
