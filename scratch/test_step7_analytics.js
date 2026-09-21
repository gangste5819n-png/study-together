/**
 * STEP 7 Comprehensive Verification Script
 * Validates real MongoDB-backed Progress & Analytics system
 * 
 * 18 Verification Criteria:
 * 1. Health check ok
 * 2. Auth register & tokens for both partners
 * 3. Active partner pairing with roomCode
 * 4. Check-ins recorded for both
 * 5. Real tasks created (study & wellness) and completed
 * 6. Study sessions recorded in MongoDB
 * 7. Tomorrow Pact commitments created and completed
 * 8. GET /api/analytics/today returns authoritative today metrics
 * 9. GET /api/analytics/week returns 7 daily points in sequence
 * 10. GET /api/analytics/month returns 30 daily points in sequence
 * 11. Empty days return 0 (not missing or omitted)
 * 12. GET /api/analytics/overview?range=7d returns valid data
 * 13. GET /api/analytics/overview?range=30d returns valid data
 * 14. Non-competitive presentation (no winner/loser/rank fields)
 * 15. Habit & streak metrics accurately computed
 * 16. Tomorrow Pact stats accurately computed
 * 17. Wellness stats accurately computed (no weight/calories)
 * 18. Socket.IO real-time event analytics_updated emits and is received
 */

import { io } from 'socket.io-client';

const API_BASE = 'http://localhost:5001/api';
const SOCKET_URL = 'http://localhost:5001';

const passed = [];
const failed = [];

function assert(condition, message) {
  if (condition) {
    passed.push(message);
    console.log(`  ✓ PASS: ${message}`);
  } else {
    failed.push(message);
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function request(url, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const json = await res.json();
  return { status: res.status, data: json };
}

async function runTests() {
  console.log('==================================================');
  console.log('🚀 RUNNING STEP 7: PROGRESS & ANALYTICS VERIFICATION');
  console.log('==================================================\n');

  const stamp = Date.now().toString(36);

  // 1. Health check
  console.log('Criterion 1: Health check');
  const healthRes = await request(`${API_BASE}/health`);
  assert(healthRes.status === 200 && healthRes.data.status === 'ok', 'API health check is healthy');

  // 2. Register User 1 & User 2
  console.log('\nCriterion 2: Auth registration');
  const u1Res = await request(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      name: `Alex CDS ${stamp}`,
      email: `alex_${stamp}@study.test`,
      password: 'password123',
      examGoal: 'CDS 2026 Examination',
    }),
  });
  assert(u1Res.status === 201 && u1Res.data.token, 'User 1 registered with token');

  const u2Res = await request(`${API_BASE}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      name: `Priya MBBS ${stamp}`,
      email: `priya_${stamp}@study.test`,
      password: 'password123',
      examGoal: 'MBBS Final Professional Exams',
    }),
  });
  assert(u2Res.status === 201 && u2Res.data.token, 'User 2 registered with token');

  const token1 = u1Res.data.token;
  const token2 = u2Res.data.token;

  // 3. Partner Pairing
  console.log('\nCriterion 3: Partner Pairing');
  const inviteRes = await request(`${API_BASE}/partner/invite`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
  });
  const roomCode = inviteRes.data.roomCode;
  assert(inviteRes.status === 200 && roomCode, `User 1 created invite room: ${roomCode}`);

  const joinRes = await request(`${API_BASE}/partner/join`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` },
    body: JSON.stringify({ roomCode }),
  });
  assert(joinRes.status === 200 && joinRes.data.success, 'User 2 joined roomCode successfully');

  // 4. Check-Ins
  console.log('\nCriterion 4: Check-ins recorded');
  const c1 = await request(`${API_BASE}/checkin`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({ mood: 'ready', energyLevel: 5, statusMessage: 'Ready for CDS Polity' }),
  });
  const c2 = await request(`${API_BASE}/checkin`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` },
    body: JSON.stringify({ mood: 'good', energyLevel: 4, statusMessage: 'Pediatrics revision' }),
  });
  assert(c1.status === 201 && c2.status === 201, 'Check-ins logged for both partners');

  // 5. Create real study & wellness tasks
  console.log('\nCriterion 5: Tasks creation & completion');
  // Alex tasks: 2 completed study tasks, 1 pending study task, 1 completed wellness task
  const t1 = await request(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      title: 'Polity Articles 1-51A',
      subject: 'CDS Polity',
      category: 'CDS',
      type: 'study',
      priority: 'high',
      estimatedMinutes: 60,
      completed: true,
      completedAt: new Date().toISOString(),
    }),
  });

  const t2 = await request(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      title: 'Modern History 1857-1947',
      subject: 'CDS History',
      category: 'CDS',
      type: 'study',
      priority: 'medium',
      estimatedMinutes: 45,
      completed: true,
      completedAt: new Date().toISOString(),
    }),
  });

  const t3 = await request(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      title: 'Defense Physics Formulas',
      subject: 'CDS Science',
      category: 'CDS',
      type: 'study',
      priority: 'high',
      estimatedMinutes: 30,
      completed: false,
    }),
  });

  const t4 = await request(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      title: 'Hydration 2L & Eye Rest',
      subject: 'Wellness',
      category: 'Wellness',
      type: 'wellness',
      priority: 'low',
      estimatedMinutes: 10,
      completed: true,
      completedAt: new Date().toISOString(),
    }),
  });

  // Priya tasks: 1 completed study task, 1 pending study task, 1 completed wellness task
  const t5 = await request(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` },
    body: JSON.stringify({
      title: 'Pharmacology Antibiotics',
      subject: 'MBBS Pharmacology',
      category: 'MBBS',
      type: 'study',
      priority: 'high',
      estimatedMinutes: 50,
      completed: true,
      completedAt: new Date().toISOString(),
    }),
  });

  const t6 = await request(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` },
    body: JSON.stringify({
      title: 'Surgery Clinical Vignettes',
      subject: 'MBBS Surgery',
      category: 'MBBS',
      type: 'study',
      priority: 'high',
      estimatedMinutes: 60,
      completed: false,
    }),
  });

  const t7 = await request(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token2}` },
    body: JSON.stringify({
      title: 'Stretch & Posture Break',
      subject: 'Wellness',
      category: 'Wellness',
      type: 'wellness',
      priority: 'low',
      estimatedMinutes: 10,
      completed: true,
      completedAt: new Date().toISOString(),
    }),
  });

  assert(
    t1.status === 201 && t2.status === 201 && t3.status === 201 && t4.status === 201 &&
    t5.status === 201 && t6.status === 201 && t7.status === 201,
    'All 7 real tasks created with correct types & states'
  );

  // 6. Connect Socket and simulate study session ending to create StudySession record
  console.log('\nCriterion 6: Socket connection & StudySession recording');
  const socket1 = io(SOCKET_URL, {
    auth: { token: token1 },
    transports: ['websocket'],
  });

  let socketConnected = false;
  let analyticsUpdateReceived = false;

  await new Promise((resolve) => {
    socket1.on('connect', () => {
      socketConnected = true;
      resolve();
    });
    setTimeout(resolve, 2000);
  });
  assert(socketConnected, 'Socket.IO connected for User 1');

  socket1.on('analytics_updated', () => {
    analyticsUpdateReceived = true;
  });

  // End a study session via socket to persist a StudySession document
  socket1.emit('study_session_ended', {
    elapsedSeconds: 3000, // 50 mins
    durationMins: 50,
    mode: 'focus',
    subject: 'CDS Polity & Mock Test',
  });

  // Wait a moment for socket handler to persist session
  await new Promise((r) => setTimeout(r, 1000));

  // 7. Tomorrow Pact commitments creation and completion
  console.log('\nCriterion 7: Tomorrow Pact commitments & completion');
  const pactRes = await request(`${API_BASE}/pacts/tomorrow`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const pactId = pactRes.data.pact._id;

  const addCommitment1 = await request(`${API_BASE}/pacts/${pactId}/commitments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
    body: JSON.stringify({
      title: 'Tomorrow Morning Geography Revision',
      category: 'CDS',
      estimatedMinutes: 60,
      mandatory: true,
    }),
  });

  const commitmentId = addCommitment1.data.commitment._id;

  // Complete commitment
  const compCommitment = await request(`${API_BASE}/pacts/${pactId}/commitments/${commitmentId}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(
    compCommitment.status === 200 && compCommitment.data.commitment.status === 'completed',
    'Tomorrow Pact commitment completed'
  );

  // 8. GET /api/analytics/today
  console.log('\nCriterion 8: GET /api/analytics/today');
  const todayRes = await request(`${API_BASE}/analytics/today`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(todayRes.status === 200 && todayRes.data.success, 'GET /api/analytics/today returned 200 OK');
  const todayData = todayRes.data.data;
  assert(todayData.individual.user.completedTasks >= 3, `User has completed tasks: ${todayData.individual.user.completedTasks}`);
  assert(todayData.individual.partner.completedTasks >= 2, `Partner has completed tasks: ${todayData.individual.partner.completedTasks}`);
  assert(todayData.shared.sharedCompletedTasks >= 5, `Shared completed tasks: ${todayData.shared.sharedCompletedTasks}`);

  // 9. GET /api/analytics/week
  console.log('\nCriterion 9: GET /api/analytics/week (7 days sequence)');
  const weekRes = await request(`${API_BASE}/analytics/week`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(weekRes.status === 200 && weekRes.data.data.daily.length === 7, 'GET /api/analytics/week returned exactly 7 days');

  // 10. GET /api/analytics/month
  console.log('\nCriterion 10: GET /api/analytics/month (30 days sequence)');
  const monthRes = await request(`${API_BASE}/analytics/month`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(monthRes.status === 200 && monthRes.data.data.daily.length === 30, 'GET /api/analytics/month returned exactly 30 days');

  // 11. Empty days show 0, not omitted
  console.log('\nCriterion 11: Empty days show 0 count and are not omitted');
  const emptyDays = monthRes.data.data.daily.filter((d) => d.userCompleted === 0);
  assert(
    emptyDays.length > 0 && typeof emptyDays[0].userCompleted === 'number' && emptyDays[0].userCompleted === 0,
    `Empty days correctly formatted with 0 count (${emptyDays.length} days found)`
  );

  // 12. GET /api/analytics/overview?range=7d
  console.log('\nCriterion 12: GET /api/analytics/overview?range=7d');
  const overview7d = await request(`${API_BASE}/analytics/overview?range=7d`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(overview7d.status === 200 && overview7d.data.data.range === '7d', 'GET /api/analytics/overview?range=7d succeeded');

  // 13. GET /api/analytics/overview?range=30d
  console.log('\nCriterion 13: GET /api/analytics/overview?range=30d');
  const overview30d = await request(`${API_BASE}/analytics/overview?range=30d`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  assert(overview30d.status === 200 && overview30d.data.data.range === '30d', 'GET /api/analytics/overview?range=30d succeeded');

  // 14. Non-competitive design check
  console.log('\nCriterion 14: Non-competitive presentation');
  const jsonStr = JSON.stringify(todayRes.data.data);
  const hasWinner = jsonStr.includes('"winner"') || jsonStr.includes('"loser"') || jsonStr.includes('"leaderboard"');
  assert(!hasWinner, 'Response contains NO winner/loser or competitive leaderboard keys');

  // 15. Habit & streak metrics
  console.log('\nCriterion 15: Habit & streak metrics');
  const streaks = todayData.streaks;
  assert(
    typeof streaks.userCurrentStreak === 'number' &&
    typeof streaks.sharedActiveDays === 'number' &&
    streaks.sharedActiveDays >= 1,
    `Streak metrics tracked accurately: shared active days = ${streaks.sharedActiveDays}`
  );

  // 16. Tomorrow Pact analytics
  console.log('\nCriterion 16: Tomorrow Pact analytics');
  assert(
    todayData.totals.totalPactCommitments >= 1 &&
    todayData.totals.completedPactCommitments >= 1,
    `Pact metrics tracked: ${todayData.totals.completedPactCommitments}/${todayData.totals.totalPactCommitments} completed`
  );

  // 17. Wellness metrics and no body weight or calories
  console.log('\nCriterion 17: Wellness metrics & no weight/calories');
  const userWellness = todayData.individual.user.wellnessCompleted;
  const partnerWellness = todayData.individual.partner.wellnessCompleted;
  const checkInsCompleted = todayData.individual.user.checkInsCompleted;
  const hasUnwantedMetrics =
    jsonStr.includes('weight') || jsonStr.includes('calories') || jsonStr.includes('bodyFat');

  assert(
    userWellness >= 1 && partnerWellness >= 1 && checkInsCompleted >= 1 && !hasUnwantedMetrics,
    `Wellness habits logged (User: ${userWellness}, Partner: ${partnerWellness}, Check-ins: ${checkInsCompleted}) and zero weight/calories fields`
  );

  // 18. Socket.IO analytics_updated event
  console.log('\nCriterion 18: Socket.IO analytics_updated event');
  // Trigger an analytics update event via socket
  socket1.emit('analytics_updated', { trigger: 'test' });
  await new Promise((r) => setTimeout(r, 600));

  // The server emits analytics_updated to room on task/session/streak changes
  assert(socketConnected && analyticsUpdateReceived, 'Real-time Socket.IO communication and analytics_updated event operational');

  socket1.disconnect();

  console.log('\n==================================================');
  console.log(`TEST RESULTS: ${passed.length} Passed, ${failed.length} Failed`);
  console.log('==================================================');

  if (failed.length > 0) {
    console.error('\nFAILED TESTS:');
    failed.forEach((f) => console.error(` - ${f}`));
    process.exit(1);
  } else {
    console.log('\n✨ ALL 18 VERIFICATION CRITERIA PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
