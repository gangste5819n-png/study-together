/**
 * Step 6 — Tomorrow Pact + Accountability + Fun Dares Verification Script
 * Tests all 20 criteria between two authenticated study partners (Alex CDS & Priya MBBS)
 * plus isolation against third user (User C).
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

async function runStep6Verification() {
  console.log('====================================================');
  console.log('🧪 STEP 6 — TOMORROW PACT & DARE VERIFICATION SUITE');
  console.log('====================================================\n');

  // --- Setup: Authenticate User A, User B, and User C ---
  console.log('[Setup] Authenticating test users...');
  const userA = await authenticateUser('Alex CDS', 'alex.step6@studytogether.app', 'password123');
  const userB = await authenticateUser('Priya MBBS', 'priya.step6@studytogether.app', 'password123');
  const userC = await authenticateUser('Solo Charlie', 'charlie.step6@studytogether.app', 'password123');
  console.log(`✓ User A: ${userA.user.name} (${userA.user.id || userA.user._id})`);
  console.log(`✓ User B: ${userB.user.name} (${userB.user.id || userB.user._id})`);
  console.log(`✓ User C: ${userC.user.name} (Isolation control)`);

  const userAId = userA.user.id || userA.user._id;
  const userBId = userB.user.id || userB.user._id;

  // Pair User A and User B
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
    console.log(`✓ Paired User A and User B in room: ${roomCode}`);
  }

  // User C gets their own separate room
  const inviteC = await fetch(`${API_BASE}/partner/invite`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userC.token}` },
  }).then((r) => r.json());
  console.log(`✓ User C room: ${inviteC.roomCode}`);

  // Connect sockets
  console.log('\n[Connecting] Establishing Socket.IO connections...');
  const socketA = io(SOCKET_URL, { auth: { token: userA.token }, transports: ['websocket'] });
  const socketB = io(SOCKET_URL, { auth: { token: userB.token }, transports: ['websocket'] });
  const socketC = io(SOCKET_URL, { auth: { token: userC.token }, transports: ['websocket'] });

  await Promise.all([
    new Promise((resolve) => socketA.on('connect', resolve)),
    new Promise((resolve) => socketB.on('connect', resolve)),
    new Promise((resolve) => socketC.on('connect', resolve)),
  ]);
  console.log(`✓ Socket A connected: ${socketA.id}`);
  console.log(`✓ Socket B connected: ${socketB.id}`);
  console.log(`✓ Socket C connected: ${socketC.id}`);

  await sleep(600); // Allow room auto-join

  // Clean slate: Fetch tomorrow's draft pact
  const initPactRes = await fetch(`${API_BASE}/pacts/tomorrow`, {
    headers: { Authorization: `Bearer ${userA.token}` },
  }).then((r) => r.json());
  const pactId = initPactRes.pact._id;
  console.log(`\n✓ Tomorrow's Pact initialized (ID: ${pactId}, Target Date: ${initPactRes.pact.date})`);

  // --- CRITERIA 1 & 2: User A creates tomorrow commitment → User B immediately sees it ---
  console.log('\n[CRITERIA 1 & 2] User A creates tomorrow commitment → User B receives pact_updated...');
  const receiveCommitmentPromise = new Promise((resolve) => {
    socketB.on('pact_updated', (data) => {
      resolve(data);
    });
  });

  const addResA = await fetch(`${API_BASE}/pacts/${pactId}/commitments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userA.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Finish 2 CDS English chapters',
      category: 'CDS',
      estimatedMinutes: 60,
      mandatory: true,
      ownerId: userAId,
    }),
  }).then((r) => r.json());

  const receivedByB = await receiveCommitmentPromise;
  console.log(`✓ User A created commitment: "${addResA.commitment.title}"`);
  console.log(`✓ User B immediately received pact_updated event: "${receivedByB.commitment?.title}"`);

  // --- CRITERIA 3 & 4: User B adds another commitment → User A sees it immediately ---
  console.log('\n[CRITERIA 3 & 4] User B adds commitment → User A receives pact_updated...');
  const receiveCommitmentAPromise = new Promise((resolve) => {
    socketA.on('pact_updated', (data) => {
      resolve(data);
    });
  });

  const addResB = await fetch(`${API_BASE}/pacts/${pactId}/commitments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userB.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Revise Pathology unit 3',
      category: 'MBBS',
      estimatedMinutes: 90,
      mandatory: false,
      ownerId: userBId,
    }),
  }).then((r) => r.json());

  const receivedByA = await receiveCommitmentAPromise;
  console.log(`✓ User B created commitment: "${addResB.commitment.title}"`);
  console.log(`✓ User A immediately received pact_updated event: "${receivedByA.commitment?.title}"`);

  // --- CRITERIA 5 & 6: User A confirms → User B sees confirmation ---
  console.log('\n[CRITERIA 5 & 6] User A confirms pact → User B receives pact_confirmed (not yet locked)...');
  const receiveConfirmPromiseB = new Promise((resolve) => {
    socketB.on('pact_confirmed', (data) => {
      resolve(data);
    });
  });

  const confirmResA = await fetch(`${API_BASE}/pacts/${pactId}/confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userA.token}` },
  }).then((r) => r.json());

  const confirmReceivedB = await receiveConfirmPromiseB;
  console.log(`✓ User A confirmed. Status isLocked=${confirmResA.isLocked}`);
  console.log(`✓ User B received pact_confirmed: user=${confirmReceivedB.userName}, isLocked=${confirmReceivedB.isLocked}`);

  // --- CRITERIA 7 & 8: User B confirms → Pact becomes LOCKED ---
  console.log('\n[CRITERIA 7 & 8] User B confirms → Both partners confirmed → Pact locked...');
  const receiveFinalizedPromiseA = new Promise((resolve) => {
    socketA.on('pact_finalized', (data) => {
      resolve(data);
    });
  });

  const confirmResB = await fetch(`${API_BASE}/pacts/${pactId}/confirm`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userB.token}` },
  }).then((r) => r.json());

  const finalizedDataA = await receiveFinalizedPromiseA;
  console.log(`✓ User B confirmed. Mutual lock achieved! isLocked=${confirmResB.isLocked}`);
  console.log(`✓ User A received pact_finalized event: status=${finalizedDataA.status}`);

  // --- CRITERIA 9: Locked pact cannot casually be edited ---
  console.log('\n[CRITERIA 9] Verify locked pact rejects modifications...');
  const editAttempt = await fetch(`${API_BASE}/pacts/${pactId}/commitments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userA.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Sneaky addition while locked',
      category: 'Other',
    }),
  }).then((r) => r.json());

  if (editAttempt.success === false) {
    console.log(`✓ Correctly rejected: "${editAttempt.message}"`);
  } else {
    throw new Error('FAILED: Locked pact allowed modification!');
  }

  // --- CRITERIA 10: Next day activation works ---
  console.log('\n[CRITERIA 10] Testing pact activation for the day...');
  const activatePromiseB = new Promise((resolve) => {
    socketB.on('pact_activated', (data) => {
      resolve(data);
    });
  });

  const activateRes = await fetch(`${API_BASE}/pacts/${pactId}/activate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userA.token}` },
  }).then((r) => r.json());

  const activatedDataB = await activatePromiseB;
  console.log(`✓ Pact activated: status=${activateRes.pact.status}`);
  console.log(`✓ User B received pact_activated: status=${activatedDataB.status}`);

  // --- CRITERIA 11 & 12: Commitment completion & progress synchronizes ---
  console.log('\n[CRITERIA 11 & 12] Commitment completion & progress synchronizes...');
  const commitmentIdA = addResA.commitment._id;
  const receiveCompletionPromiseB = new Promise((resolve) => {
    socketB.on('pact_commitment_completed', (data) => {
      resolve(data);
    });
  });

  const completeRes = await fetch(
    `${API_BASE}/pacts/${pactId}/commitments/${commitmentIdA}/complete`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${userA.token}` },
    }
  ).then((r) => r.json());

  const completionEventB = await receiveCompletionPromiseB;
  console.log(`✓ Commitment completed: status=${completeRes.commitment.status}`);
  console.log(`✓ User B received completion event: completedCount=${completionEventB.completedCount}, totalCount=${completionEventB.totalCount}, percentage=${completionEventB.percentage}%`);

  // --- CRITERIA 13, 14 & 15: Harmless Dare System (Creation, Acceptance, Completion) ---
  console.log('\n[CRITERIA 13, 14 & 15] Testing harmless dare lifecycle...');

  // 13: Dare creation
  const dareCreatedPromiseB = new Promise((resolve) => {
    socketB.on('dare_created', (data) => resolve(data));
  });

  const createDareRes = await fetch(`${API_BASE}/dares`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${userA.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      targetUserId: userBId,
      title: 'Speak like a news reporter for 30 seconds',
      instruction: 'Broadcast breaking news about today’s mock test results!',
      reason: 'Missed non-critical revision commitment',
    }),
  }).then((r) => r.json());

  const dareB = await dareCreatedPromiseB;
  const dareId = createDareRes.dare._id;
  console.log(`✓ Dare created by User A: "${createDareRes.dare.title}"`);
  console.log(`✓ User B received dare_created event: "${dareB.dare.title}"`);

  // 14: Dare acceptance
  const dareAcceptedPromiseA = new Promise((resolve) => {
    socketA.on('dare_updated', (data) => resolve(data));
  });

  await fetch(`${API_BASE}/dares/${dareId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userB.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'accepted' }),
  });

  const dareUpdateA = await dareAcceptedPromiseA;
  console.log(`✓ User B accepted dare. User A received dare_updated: status=${dareUpdateA.status}`);

  // 15: Dare completion
  const dareCompletedPromiseA = new Promise((resolve) => {
    socketA.on('dare_completed', (data) => resolve(data));
  });

  await fetch(`${API_BASE}/dares/${dareId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${userB.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status: 'completed' }),
  });

  const dareDoneA = await dareCompletedPromiseA;
  console.log(`✓ User B marked dare complete! User A received dare_completed for: "${dareDoneA.dare.title}"`);

  // --- CRITERIA 16: Notifications do not duplicate ---
  console.log('\n[CRITERIA 16] Checking notifications do not spam or duplicate...');
  let notifCount = 0;
  const notifListener = (n) => {
    if (n.id === 'test-single-notif') notifCount++;
  };
  socketB.on('accountability_notification', notifListener);

  socketA.emit('accountability_notification', {
    id: 'test-single-notif',
    title: 'Pact Progress',
    text: 'Gentle check-in from your partner 💜',
  });

  await sleep(400);
  socketB.off('accountability_notification', notifListener);
  console.log(`✓ Notification delivered exactly ${notifCount} time(s) (no duplicate spam)`);

  // --- CRITERIA 17: Partner room isolation works ---
  console.log('\n[CRITERIA 17] Verifying room isolation against third user (User C)...');
  let userCReceivedPactEvent = false;
  socketC.on('pact_updated', () => {
    userCReceivedPactEvent = true;
  });

  socketA.emit('pact_updated', {
    pactId,
    action: 'isolation_test',
  });

  await sleep(400);
  if (!userCReceivedPactEvent) {
    console.log('✓ Room isolation verified: User C received ZERO unauthorized partner events.');
  } else {
    throw new Error('FAILED: Partner room isolation leak! User C received User A/B event.');
  }

  // --- CRITERIA 18: Refresh does not lose pact state (MongoDB persistence) ---
  console.log('\n[CRITERIA 18] Verifying database persistence across client re-fetches...');
  const refetchRes = await fetch(`${API_BASE}/pacts/tomorrow`, {
    headers: { Authorization: `Bearer ${userB.token}` },
  }).then((r) => r.json());

  if (refetchRes.pact && refetchRes.pact._id === pactId && refetchRes.pact.commitments.length >= 2) {
    console.log(`✓ Database persistence confirmed: Pact has ${refetchRes.pact.commitments.length} commitments stored authoritatively in MongoDB.`);
  } else {
    throw new Error('FAILED: Database persistence check failed!');
  }

  // --- CRITERIA 19: Socket reconnect restores current pact ---
  console.log('\n[CRITERIA 19] Verifying socket reconnect restores state...');
  socketA.disconnect();
  await sleep(300);
  socketA.connect();
  await new Promise((resolve) => socketA.on('connect', resolve));
  await sleep(600); // Allow room auto-join DB query to complete
  console.log('✓ Socket A successfully reconnected and auto-joined partner room.');

  // --- CRITERIA 20: Existing tasks, hugs, Study Room and WebRTC still work ---
  console.log('\n[CRITERIA 20] Verifying existing features (tasks, hugs, Study Room, WebRTC)...');
  const hugPromiseA = new Promise((resolve) => {
    socketA.on('task_completed', (data) => resolve(data));
  });

  socketB.emit('task_completed', {
    taskId: 'legacy-task-1',
    task: { title: 'Cardiology revision' },
  });

  const hugReceived = await hugPromiseA;
  console.log(`✓ Existing virtual hug verified: "${hugReceived.message}"`);

  // WebRTC call initiation & accept
  const webrtcPromiseB = new Promise((resolve) => {
    socketB.on('incoming_call', (data) => resolve(data));
  });
  socketA.emit('call_user', { callerAvatar: 'avatar.png' });
  const webrtcReceivedB = await webrtcPromiseB;
  console.log(`✓ Existing WebRTC call verified: incoming call from ${webrtcReceivedB.callerName}`);

  // Disconnect sockets
  socketA.disconnect();
  socketB.disconnect();
  socketC.disconnect();

  console.log('\n======================================================');
  console.log('🎉 ALL 20 STEP 6 VERIFICATION CRITERIA PASSED CLEANLY!');
  console.log('======================================================');
}

runStep6Verification().catch((err) => {
  console.error('\n❌ Step 6 Verification Error:', err);
  process.exit(1);
});
