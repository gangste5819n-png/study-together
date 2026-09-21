/**
 * STEP 10 — PRODUCTION SECURITY & RESILIENCE VERIFICATION SUITE
 * Tests:
 * 1. Unauthorized API access (401)
 * 2. Invalid JWT rejection (401)
 * 3. Expired JWT rejection (401)
 * 4. Input validation (malformed payloads rejected with 400)
 * 5. Cross-user task isolation (User C cannot view/edit/delete User A's tasks)
 * 6. Cross-user notification isolation (User C cannot view/delete User A's notifications)
 * 7. Cross-user pact isolation (User C cannot edit/confirm User A & B's pact)
 * 8. Partner room isolation in Socket.IO (User C receives zero private events)
 * 9. Rate limiting on sensitive endpoints (429)
 * 10. Sanitized health check (no secrets or internal DB host leaked)
 * 11. Password security (password hashes never returned in API responses)
 */

import jwt from 'jsonwebtoken';
import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';
const TEST_RUN_ID = Date.now();

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data, headers: res.headers };
}

async function runSecuritySuite() {
  console.log('\n==================================================');
  console.log('🛡️ RUNNING STEP 10: PRODUCTION SECURITY AUDIT TEST');
  console.log('==================================================\n');

  // -------------------------------------------------------------
  // Test 1: Unauthorized API requests strictly rejected with 401
  // -------------------------------------------------------------
  console.log('[Test 1] Verifying unauthenticated requests return 401 Unauthorized...');
  const unauthTasks = await request('/tasks');
  assert(unauthTasks.status === 401, 'GET /api/tasks without token returns 401');

  const unauthNotifs = await request('/notifications');
  assert(unauthNotifs.status === 401, 'GET /api/notifications without token returns 401');

  const unauthPacts = await request('/pacts/tomorrow');
  assert(unauthPacts.status === 401, 'GET /api/pacts/tomorrow without token returns 401');

  // -------------------------------------------------------------
  // Test 2: Invalid JWT token rejection
  // -------------------------------------------------------------
  console.log('\n[Test 2] Verifying invalid JWT token rejection...');
  const invalidTokenRes = await request('/tasks', {
    headers: { Authorization: 'Bearer this.is.a.fake.malformed.jwt.token' },
  });
  assert(invalidTokenRes.status === 401, 'Request with forged/malformed JWT returns 401');

  // -------------------------------------------------------------
  // Test 3: Expired JWT token rejection
  // -------------------------------------------------------------
  console.log('\n[Test 3] Verifying expired JWT token rejection...');
  // Forge a token with exp in the past
  const secret = 'dev_study_together_jwt_secret_key_change_in_prod';
  const expiredToken = jwt.sign(
    { userId: '507f1f77bcf86cd799439011', email: 'expired@example.com' },
    secret,
    { expiresIn: -60 } // expired 60 seconds ago
  );
  const expiredRes = await request('/tasks', {
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  assert(expiredRes.status === 401, 'Request with expired JWT returns 401');

  // -------------------------------------------------------------
  // Setup Users: User A, User B, and User C (Attacker / Isolator)
  // -------------------------------------------------------------
  console.log('\n[Setup] Registering test identities...');
  const userARes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Security User A',
      email: `user_a_${TEST_RUN_ID}@example.com`,
      password: 'StrongPassword123!',
    }),
  });
  assert(userARes.status === 201 && userARes.data?.token, 'User A registered');
  const tokenA = userARes.data.token;
  const userA = userARes.data.user;

  const userBRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Security User B',
      email: `user_b_${TEST_RUN_ID}@example.com`,
      password: 'StrongPassword123!',
    }),
  });
  assert(userBRes.status === 201 && userBRes.data?.token, 'User B registered');
  const tokenB = userBRes.data.token;

  const userCRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Security User C',
      email: `user_c_${TEST_RUN_ID}@example.com`,
      password: 'StrongPassword123!',
    }),
  });
  assert(userCRes.status === 201 && userCRes.data?.token, 'User C registered');
  const tokenC = userCRes.data.token;

  // -------------------------------------------------------------
  // Test 4: Password Security (Never expose passwordHash)
  // -------------------------------------------------------------
  console.log('\n[Test 4] Verifying password security...');
  assert(!userA.passwordHash, 'User A registration does NOT expose passwordHash');
  assert(!userA.password, 'User A registration does NOT expose plain password');

  const meRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(!meRes.data?.user?.passwordHash, 'GET /api/auth/me does NOT expose passwordHash');

  // -------------------------------------------------------------
  // Test 5: Input Validation & Sanitization
  // -------------------------------------------------------------
  console.log('\n[Test 5] Verifying input validation rejecting malformed requests...');

  // 5a. Empty task title
  const emptyTaskRes = await request('/tasks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ title: '   ' }),
  });
  assert(emptyTaskRes.status === 400, 'Empty task title rejected with 400');

  // 5b. Excessive task title (> 200 chars)
  const longTaskRes = await request('/tasks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ title: 'A'.repeat(250) }),
  });
  assert(longTaskRes.status === 400, 'Oversized task title rejected with 400');

  // 5c. Invalid estimated minutes (negative)
  const invalidMinsRes = await request('/tasks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({ title: 'Valid Title', estimatedMinutes: -10 }),
  });
  assert(invalidMinsRes.status === 400, 'Negative estimated minutes rejected with 400');

  // 5d. Malformed registration
  const badEmailRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Bad Email',
      email: 'not-an-email',
      password: 'Password123!',
    }),
  });
  assert(badEmailRes.status === 400, 'Malformed email format rejected with 400');

  const shortPassRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Short Pass',
      email: `short_${TEST_RUN_ID}@example.com`,
      password: '123',
    }),
  });
  assert(shortPassRes.status === 400, 'Short password (<6 chars) rejected with 400');

  // -------------------------------------------------------------
  // Test 6: Cross-User Task Authorization & Isolation
  // -------------------------------------------------------------
  console.log('\n[Test 6] Verifying cross-user task authorization...');
  // User A creates a task
  const createA = await request('/tasks', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
    body: JSON.stringify({
      title: 'User A Secret Task',
      estimatedMinutes: 45,
    }),
  });
  assert(createA.status === 201, 'User A created private task');
  const taskAId = createA.data.task._id;

  // User C attempts to read tasks — should NOT see User A's task
  const tasksC = await request('/tasks', {
    headers: { Authorization: `Bearer ${tokenC}` },
  });
  const foundTaskA = tasksC.data.tasks.some((t) => t._id === taskAId);
  assert(!foundTaskA, 'User C GET /api/tasks does NOT contain User A private task');

  // User C attempts to update User A's task
  const updateByC = await request(`/tasks/${taskAId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenC}` },
    body: JSON.stringify({ title: 'Hacked by User C' }),
  });
  assert(updateByC.status === 404, 'User C PATCH User A task rejected with 404 (isolation enforced)');

  // User C attempts to toggle User A's task
  const toggleByC = await request(`/tasks/${taskAId}/toggle`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenC}` },
  });
  assert(toggleByC.status === 404, 'User C PATCH toggle User A task rejected with 404');

  // User C attempts to delete User A's task
  const deleteByC = await request(`/tasks/${taskAId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${tokenC}` },
  });
  assert(deleteByC.status === 404, 'User C DELETE User A task rejected with 404');

  // -------------------------------------------------------------
  // Test 7: Cross-User Notification Authorization
  // -------------------------------------------------------------
  console.log('\n[Test 7] Verifying cross-user notification authorization...');
  // Trigger a notification for User A
  await request('/notifications/trigger-scheduler', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });

  const notifsA = await request('/notifications', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(notifsA.status === 200, 'User A notifications fetched');

  const listA = notifsA.data?.data?.notifications || notifsA.data?.notifications || [];

  if (listA.length > 0) {
    const notifAId = listA[0]._id;

    // User C attempts to mark User A's notification as read
    const markReadByC = await request(`/notifications/${notifAId}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenC}` },
    });
    assert(markReadByC.status === 404, 'User C marking User A notification read rejected with 404');

    // User C attempts to delete User A's notification
    const deleteNotifByC = await request(`/notifications/${notifAId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenC}` },
    });
    assert(deleteNotifByC.status === 404, 'User C deleting User A notification rejected with 404');
  } else {
    // If no notifications existed, verify empty list for C
    const notifsC = await request('/notifications', {
      headers: { Authorization: `Bearer ${tokenC}` },
    });
    const listC = notifsC.data?.data?.notifications || notifsC.data?.notifications || [];
    assert(listC.length === 0, 'User C has zero unauthorized notifications');
  }


  // -------------------------------------------------------------
  // Test 8: Pair User A & User B and Verify Pact Isolation
  // -------------------------------------------------------------
  console.log('\n[Test 8] Verifying Tomorrow Pact isolation...');
  const inviteRes = await request('/partner/invite', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  const roomCode = inviteRes.data.roomCode;

  const joinRes = await request('/partner/join', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenB}` },
    body: JSON.stringify({ roomCode }),
  });
  assert(joinRes.status === 200, 'User A and User B successfully paired');

  // User A initializes pact
  const pactRes = await request('/pacts/tomorrow', {
    headers: { Authorization: `Bearer ${tokenA}` },
  });
  assert(pactRes.status === 200 && pactRes.data?.pact, 'Pact created for pair A-B');
  const pactId = pactRes.data.pact._id;

  // User C (unpaired solo user) attempts to access / edit pact
  const pactAccessByC = await request(`/pacts/${pactId}`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${tokenC}` },
    body: JSON.stringify({
      commitment: { title: 'Unauthorized Commitment' },
    }),
  });
  assert(pactAccessByC.status === 403, 'User C updating User A-B pact rejected with 403 Unauthorized');

  const addCommitmentByC = await request(`/pacts/${pactId}/commitments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenC}` },
    body: JSON.stringify({ title: 'Hacked Commitment' }),
  });
  assert(addCommitmentByC.status === 403, 'User C adding commitment to A-B pact rejected with 403 Unauthorized');

  // -------------------------------------------------------------
  // Test 9: Socket.IO Partner Room Isolation
  // -------------------------------------------------------------
  console.log('\n[Test 9] Verifying Socket.IO room isolation against User C...');
  let userCReceivedLeak = false;

  const socketC = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token: tokenC },
  });

  await new Promise((resolve) => socketC.on('connect', resolve));

  // User C attempts unauthorized join into User A & B room
  socketC.emit('join_partner_room', { roomCode });

  socketC.on('task_created', () => { userCReceivedLeak = true; });
  socketC.on('partner_task_created', () => { userCReceivedLeak = true; });
  socketC.on('pact_updated', () => { userCReceivedLeak = true; });

  // Connect Socket A and emit an event in the room
  const socketA = io(SOCKET_URL, {
    transports: ['websocket'],
    auth: { token: tokenA },
  });
  await new Promise((resolve) => socketA.on('connect', resolve));

  socketA.emit('task_created', {
    task: { title: 'Secret Task A Event' },
  });

  await new Promise((r) => setTimeout(r, 600));

  assert(!userCReceivedLeak, 'User C received ZERO unauthorized room events (partner room isolation confirmed)');

  socketA.disconnect();
  socketC.disconnect();

  // -------------------------------------------------------------
  // Test 10: Sanitized Health Check
  // -------------------------------------------------------------
  console.log('\n[Test 10] Verifying health check endpoint security...');
  const healthRes = await request('/health');
  assert(healthRes.status === 200, 'GET /api/health returned 200 OK');
  assert(healthRes.data?.database?.connected === true, 'Health check indicates database connected: true');
  assert(healthRes.data?.realtime?.status === 'ready', 'Health check indicates realtime status ready');

  // Check that sensitive internal credentials are not leaked
  const healthString = JSON.stringify(healthRes.data);
  assert(!healthString.includes('mongodb+srv://'), 'Health check does NOT leak MongoDB connection string');
  assert(!healthString.includes('password'), 'Health check does NOT leak password fields');
  assert(!healthString.includes('secret'), 'Health check does NOT leak JWT secret');

  // -------------------------------------------------------------
  // Test 11: Security Headers (Helmet verification)
  // -------------------------------------------------------------
  console.log('\n[Test 11] Verifying Helmet security headers on API responses...');
  const headerCheck = await request('/health');
  assert(headerCheck.headers.get('x-content-type-options') === 'nosniff', 'X-Content-Type-Options: nosniff is set');
  assert(headerCheck.headers.get('cross-origin-resource-policy') === 'cross-origin', 'Cross-Origin-Resource-Policy: cross-origin is set');


  // -------------------------------------------------------------
  // Test 12: Rate Limiting Enforcement (Trigger Scheduler Limiter)
  // -------------------------------------------------------------
  console.log('\n[Test 12] Verifying rate limiter enforcement...');
  // The schedulerTriggerLimiter allows 5 requests per minute. Let's send requests until 429 is hit
  let hitRateLimit = false;
  for (let i = 0; i < 7; i++) {
    const res = await request('/notifications/trigger-scheduler', {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    if (res.status === 429) {
      hitRateLimit = true;
      break;
    }
  }
  assert(hitRateLimit, 'Trigger scheduler endpoint properly enforces rate limiting and returned HTTP 429');

  console.log('\n==================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} SECURITY TESTS PASSED CLEANLY!`);
  console.log('==================================================\n');
}

runSecuritySuite().catch((err) => {
  console.error('\n❌ Security Test Suite Failed:', err.message);
  process.exit(1);
});
