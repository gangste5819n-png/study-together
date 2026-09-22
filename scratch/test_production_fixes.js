import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

const results = {
  passed: [],
  failed: [],
};

function assert(condition, message) {
  if (condition) {
    results.passed.push(message);
    console.log(`  ✓ PASS: ${message}`);
  } else {
    results.failed.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

async function runTests() {
  console.log('\n--- 1. HEALTH ENDPOINT TEST ---');
  const healthRes = await request('/health');
  assert(healthRes.status === 200, 'Health endpoint returns HTTP 200');
  assert(healthRes.data?.status === 'ok', 'Health status is "ok"');

  console.log('\n--- 2. UNAUTHENTICATED PROTECTION TESTS ---');
  const unauthAnalytics = await request('/analytics/overview?range=7d');
  assert(unauthAnalytics.status === 401, 'Unauthenticated /analytics/overview returns HTTP 401');

  const unauthPacts = await request('/pacts/tomorrow');
  assert(unauthPacts.status === 401, 'Unauthenticated /pacts/tomorrow returns HTTP 401');

  const unauthSettings = await request('/auth/me', { method: 'PATCH', body: JSON.stringify({ name: 'Test' }) });
  assert(unauthSettings.status === 401, 'Unauthenticated PATCH /auth/me returns HTTP 401');

  console.log('\n--- 3. AUTHENTICATION & TOKEN FLOW ---');
  const testEmail1 = `user1_${Date.now()}@studytogether.app`;
  const testEmail2 = `user2_${Date.now()}@studytogether.app`;

  const reg1 = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Aditi Rao',
      email: testEmail1,
      password: 'Password123!',
      examGoal: 'CDS 2026',
    }),
  });
  assert(reg1.status === 201, 'User 1 registered successfully');
  assert(Boolean(reg1.data?.token), 'JWT token returned on registration');
  assert(reg1.data?.user?.name === 'Aditi Rao', 'User 1 name matches in returned user');
  const token1 = reg1.data.token;
  const user1Id = reg1.data.user._id;

  const reg2 = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Rohan Verma',
      email: testEmail2,
      password: 'Password123!',
      examGoal: 'Final Year MBBS',
    }),
  });
  assert(reg2.status === 201, 'User 2 registered successfully');
  const token2 = reg2.data.token;
  const user2Id = reg2.data.user._id;

  // Test Login
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail1,
      password: 'Password123!',
    }),
  });
  assert(loginRes.status === 200, 'User 1 logged in successfully');
  assert(Boolean(loginRes.data?.token), 'JWT token returned on login');

  console.log('\n--- 4. AUTHENTICATED USER LOADING ---');
  const meRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(meRes.status === 200, 'GET /api/auth/me returns HTTP 200');
  assert(meRes.data?.user?._id === user1Id, 'GET /api/auth/me returns correct user ID');
  assert(meRes.data?.user?.name === 'Aditi Rao', 'GET /api/auth/me returns real name (not mock data)');

  console.log('\n--- 5. SETTINGS / PROFILE PERSISTENCE (PATCH /api/auth/me) ---');
  const updateRes = await request('/auth/me', {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      name: 'Aditi Rao (CDS Officer Aspirant)',
      examGoal: 'CDS OTA Merit Rank 1',
      targetStudyMinutes: 540,
    }),
  });
  assert(updateRes.status === 200, 'PATCH /api/auth/me returns HTTP 200');
  assert(updateRes.data?.user?.name === 'Aditi Rao (CDS Officer Aspirant)', 'PATCH /api/auth/me returns updated name');
  assert(updateRes.data?.user?.examGoal === 'CDS OTA Merit Rank 1', 'PATCH /api/auth/me returns updated goal');
  assert(updateRes.data?.user?.targetStudyMinutes === 540, 'PATCH /api/auth/me returns updated targetStudyMinutes');

  // Verify persistence on fresh read (simulating page refresh)
  const refreshMeRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(refreshMeRes.data?.user?.name === 'Aditi Rao (CDS Officer Aspirant)', 'Persistence verified: GET /auth/me retains updated name');
  assert(refreshMeRes.data?.user?.targetStudyMinutes === 540, 'Persistence verified: GET /auth/me retains targetStudyMinutes');

  console.log('\n--- 6. TOMORROW PACT PAIRING ENFORCEMENT & CREATION ---');
  // Unpaired user check
  const unpairedPactRes = await request('/pacts/tomorrow', {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(
    unpairedPactRes.status === 404,
    'Unpaired authenticated user receives HTTP 404 for tomorrow pact'
  );
  assert(
    unpairedPactRes.data?.message?.includes('No active partner connection found'),
    'Unpaired message explicitly indicates partner connection required'
  );

  // Now pair users via room code
  const inviteRes = await request('/partner/invite', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(inviteRes.status === 200, 'User 1 created partner invite');
  const roomCode = inviteRes.data?.roomCode;
  assert(Boolean(roomCode), `Generated room code: ${roomCode}`);

  const joinRes = await request('/partner/join', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` },
    body: JSON.stringify({ roomCode }),
  });
  assert(joinRes.status === 200, 'User 2 joined partner room code successfully');

  // Now paired: User 1 fetches tomorrow pact
  const pairedPactRes = await request('/pacts/tomorrow', {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(pairedPactRes.status === 200, 'Paired user receives HTTP 200 for tomorrow pact');
  const pactId = pairedPactRes.data?.pact?._id;
  assert(Boolean(pactId), 'Tomorrow pact ID generated and active');

  // Add commitment: tests backend owner derivation (no 'me' string)
  const addCommitmentRes = await request(`/pacts/${pactId}/commitments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      title: 'Solve CDS Mathematics Mock Paper 1',
      category: 'CDS',
      estimatedMinutes: 120,
      mandatory: true,
      ownerId: 'me', // Should safely resolve to req.user.userId
    }),
  });
  assert(addCommitmentRes.status === 201, 'Commitment added to Tomorrow Pact successfully (HTTP 201)');
  const addedCommitment = addCommitmentRes.data?.commitment;
  assert(addedCommitment?.title === 'Solve CDS Mathematics Mock Paper 1', 'Commitment title matches');
  assert(addedCommitment?.ownerId === user1Id, 'Backend derived ownerId from req.user.userId (no "me" string in DB)');

  console.log('\n--- 7. PROGRESS / ANALYTICS TEST ---');
  const analyticsRes = await request('/analytics/overview?range=7d', {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(analyticsRes.status === 200, 'GET /api/analytics/overview returns HTTP 200 for authenticated user');
  assert(Boolean(analyticsRes.data?.data?.individual?.user), 'Individual user analytics returned');
  assert(analyticsRes.data?.data?.isPaired === true, 'Analytics identifies paired relationship');
  assert(typeof analyticsRes.data?.data?.individual?.user?.totalTasks === 'number', 'Tasks count is valid number');
  assert(Array.isArray(analyticsRes.data?.data?.daily), 'Daily activity timeline array returned');

  console.log('\n--- 8. SOCKET.IO AUTHENTICATED REAL-TIME TEST ---');
  await new Promise((resolve) => {
    const socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      auth: { token: token1 },
      timeout: 10000,
    });

    socket.on('connect', () => {
      assert(true, `Socket.IO connected successfully (socket ID: ${socket.id})`);
      assert(socket.connected, 'Socket.IO state is connected');

      socket.emit('join_partner_room', { roomCode });

      setTimeout(() => {
        socket.disconnect();
        assert(!socket.connected, 'Socket cleanly disconnected');
        resolve();
      }, 800);
    });

    socket.on('connect_error', (err) => {
      assert(false, `Socket connection error: ${err.message}`);
      resolve();
    });
  });

  console.log('\n====================================');
  console.log(`TOTAL PASSED: ${results.passed.length}`);
  console.log(`TOTAL FAILED: ${results.failed.length}`);
  console.log('====================================\n');

  if (results.failed.length > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
