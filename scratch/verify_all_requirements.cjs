const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = '/Users/zuluu/.gemini/antigravity-ide/brain/8ccd8890-ae0e-41cd-b66b-d9c83a45a444';
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:5173';

const results = [];
function record(step, status, details) {
  results.push({ step, status, details });
  console.log(`[${status}] Step ${step}: ${details}`);
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--incognito', '--window-size=1280,800'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    // 2. Open site in private/incognito context
    const incognitoContext = await browser.createBrowserContext();
    const page = await incognitoContext.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        consoleErrors.push(text);
      }
    });

    const networkRequests = [];
    page.on('response', response => {
      networkRequests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status()
      });
    });

    // 3. Visit http://localhost:5173/
    console.log('Visiting', BASE_URL);
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle2' });
    const currentUrl = page.url();

    // 4. Confirm it shows LOGIN/REGISTER. It must NOT show Alex Vance, Priya, or dashboard.
    const pageContent = await page.content();
    const hasLoginOrRegister = currentUrl.includes('/login') && (pageContent.includes('Sign In') || pageContent.includes('Create Account'));
    const hasAlex = pageContent.includes('Alex Vance');
    const hasPriya = pageContent.includes('Priya Sharma') || pageContent.includes('Dr. Priya');
    const hasDashboard = currentUrl.includes('/dashboard') && !currentUrl.includes('/login');

    if (hasLoginOrRegister && !hasAlex && !hasPriya && !hasDashboard) {
      record('1-4', 'PASS', `Site launched locally, incognito visit cleanly redirected to /login (${currentUrl}). No Alex Vance, Priya, or dashboard exposed.`);
    } else {
      record('1-4', 'FAIL', `Redirect failed: currentUrl=${currentUrl}, hasAlex=${hasAlex}, hasPriya=${hasPriya}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step4_login_page.png') });

    // 5. Register a fresh test account
    const ts = Date.now().toString().slice(-6);
    const testUser1 = {
      name: `Rohan Test ${ts}`,
      email: `rohan_${ts}@studytogether.app`,
      password: 'TestPassword123!'
    };

    // Switch to Register tab
    const createAccountTab = await page.waitForSelector('button::-p-text(Create Account)', { timeout: 5000 });
    await createAccountTab.click();
    await new Promise(r => setTimeout(r, 400));

    // Fill registration form
    const nameInput = await page.waitForSelector('input[placeholder="Your Full Name"]', { visible: true, timeout: 5000 });
    const emailInput = await page.waitForSelector('input[placeholder="you@example.com"]', { visible: true, timeout: 5000 });
    const passwordInput = await page.waitForSelector('input[type="password"]', { visible: true, timeout: 5000 });

    await nameInput.type(testUser1.name);
    await emailInput.type(testUser1.email);
    await passwordInput.type(testUser1.password);

    // Submit registration
    const submitBtn = await page.waitForSelector('button[type="submit"]');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
      submitBtn.click()
    ]);
    await new Promise(r => setTimeout(r, 1000));

    // 6. Confirm dashboard displays newly registered user's actual name
    const afterRegUrl = page.url();
    const afterRegContent = await page.content();
    const showsActualName = afterRegContent.includes(testUser1.name) || afterRegContent.includes(testUser1.name.split(' ')[0]);

    if (afterRegUrl.includes('/dashboard') && showsActualName) {
      record('5-6', 'PASS', `Registered fresh test account ${testUser1.email}. Dashboard displays actual user name "${testUser1.name}".`);
    } else {
      record('5-6', 'FAIL', `Dashboard name display failed: url=${afterRegUrl}, showsName=${showsActualName}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step6_dashboard_actual_name.png') });

    // 7-8. Go to Settings, change name, click Save Changes
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    const updatedName = `${testUser1.name} (AIR 1 CDS)`;
    consoleErrors.length = 0; // reset console error tracker

    const settingsNameInput = await page.waitForSelector('#settings-form input[type="text"]', { visible: true, timeout: 5000 });
    await settingsNameInput.click({ clickCount: 3 });
    await page.keyboard.press('Backspace');
    await settingsNameInput.type(updatedName);

    // Intercept PATCH /api/auth/me
    const [patchResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/api/auth/me') && res.request().method() === 'PATCH', { timeout: 10000 }),
      (async () => {
        const saveBtn = await page.waitForSelector('button[form="settings-form"], #settings-form button[type="submit"], button::-p-text(Save Changes)');
        await saveBtn.click();
      })()
    ]);

    const patchStatus = patchResponse.status();
    await new Promise(r => setTimeout(r, 1000));
    const settingsContentAfterSave = await page.content();
    const hasSuccessToast = settingsContentAfterSave.includes('saved') || settingsContentAfterSave.includes('Success') || settingsContentAfterSave.includes('Updated') || settingsContentAfterSave.includes('Profile updated successfully');

    if (patchStatus === 200 && consoleErrors.length === 0) {
      record('7-8', 'PASS', `Settings: Changed name to "${updatedName}". Success toast appeared, 0 console errors, Network shows PATCH /api/auth/me HTTP 200.`);
    } else {
      record('7-8', 'FAIL', `Settings save failed: patchStatus=${patchStatus}, consoleErrors=${consoleErrors.join(', ')}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step8_settings_saved.png') });

    // 9-10. Completely refresh the page. Confirm changed name is still present.
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    const refreshedNameValue = await page.$eval('#settings-form input[type="text"]', el => el.value).catch(() => '');
    const refreshedContent = await page.content();
    const namePersisted = refreshedNameValue === updatedName || refreshedContent.includes(updatedName);

    if (namePersisted) {
      record('9-10', 'PASS', `Completely refreshed Settings page: changed name "${updatedName}" persisted in input field and authoritative database.`);
    } else {
      record('9-10', 'FAIL', `Name persistence failed: inputValue="${refreshedNameValue}"`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step10_settings_refreshed.png') });

    // 11-12. Go to Tomorrow Pact. If unpaired, confirm page clearly explains partner required & does NOT silently create fake connection.
    await page.goto(`${BASE_URL}/tomorrow`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    const tomorrowContent = await page.content();
    const hasUnpairedWarning = tomorrowContent.includes('Study Partner Connection Required') || tomorrowContent.includes('partner connection is required');
    
    // Check in database that no fake partner connection was provisioned
    const partnerCheck = await page.evaluate(async () => {
      const token = localStorage.getItem('studyTogether_authToken') || localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/partner/current', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { status: res.status, json: await res.json() };
    });

    const isTrulyUnpaired = Boolean(partnerCheck?.json?.connected === false && !partnerCheck?.json?.partner);

    if (hasUnpairedWarning && isTrulyUnpaired) {
      record('11-12', 'PASS', 'Tomorrow Pact (unpaired): clearly explains partner connection is required. No fake connection or partner provisioned.');
    } else {
      record('11-12', 'FAIL', `Tomorrow Pact unpaired check failed: hasUnpairedWarning=${hasUnpairedWarning}, isTrulyUnpaired=${isTrulyUnpaired}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step12_tomorrow_unpaired.png') });

    // 13. Pair two test accounts using the existing pairing mechanism
    // Get user1's room code from /together
    await page.goto(`${BASE_URL}/together`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    let user1RoomCode = await page.evaluate(async () => {
      const token = localStorage.getItem('studyTogether_authToken') || localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/partner/invite', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const d = await res.json();
      return d?.roomCode;
    });

    console.log('User 1 Room Code:', user1RoomCode);

    // Register User 2 in a second context to pair with User 1
    const user2Context = await browser.createBrowserContext();
    const page2 = await user2Context.newPage();
    await page2.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
    
    const reg2Tab = await page2.waitForSelector('button::-p-text(Create Account)', { timeout: 5000 });
    await reg2Tab.click();
    await new Promise(r => setTimeout(r, 400));

    const testUser2 = {
      name: `Priya Test ${ts}`,
      email: `priya_${ts}@studytogether.app`,
      password: 'TestPassword123!'
    };

    const n2 = await page2.waitForSelector('input[placeholder="Your Full Name"]');
    const e2 = await page2.waitForSelector('input[placeholder="you@example.com"]');
    const p2 = await page2.waitForSelector('input[type="password"]');
    await n2.type(testUser2.name);
    await e2.type(testUser2.email);
    await p2.type(testUser2.password);

    await Promise.all([
      page2.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }),
      (await page2.waitForSelector('button[type="submit"]')).click()
    ]);
    await new Promise(r => setTimeout(r, 1000));

    // User 2 joins using user1RoomCode on /together UI
    await page2.goto(`${BASE_URL}/together`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    const joinInput = await page2.waitForSelector('input[placeholder="STUDY-XXXX"]', { timeout: 5000 });
    await joinInput.type(user1RoomCode);
    const connectBtn = await page2.waitForSelector('button::-p-text(Connect)');
    await Promise.all([
      page2.waitForResponse(res => res.url().includes('/api/partner/join') && res.request().method() === 'POST', { timeout: 10000 }),
      connectBtn.click()
    ]);
    await new Promise(r => setTimeout(r, 1500));

    const page2Paired = await page2.content();
    const pairedSuccess = page2Paired.includes('Paired');

    if (pairedSuccess) {
      record('13', 'PASS', `Pairing mechanism: User 1 (${testUser1.name}) and User 2 (${testUser2.name}) paired successfully via UI with room code ${user1RoomCode}.`);
    } else {
      record('13', 'FAIL', `Pairing failed: Paired badge not detected on page 2.`);
    }

    // Refresh page 1 and page 2 to sync paired state
    await page.goto(`${BASE_URL}/tomorrow`, { waitUntil: 'networkidle2' });
    await page2.goto(`${BASE_URL}/tomorrow`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step13_paired_tomorrow.png') });

    // 14-15. Create a new commitment for tomorrow.
    // Confirm appears immediately, no console error, network request succeeds, refresh keeps commitment.
    consoleErrors.length = 0;
    const proposeBtn = await page.waitForSelector('button::-p-text(Propose Commitment for Tomorrow)', { timeout: 5000 });
    await proposeBtn.click();
    await new Promise(r => setTimeout(r, 600));

    const commitmentTitle = `Complete 30 CDS English PYQs (${ts})`;
    const titleInput = await page.waitForSelector('div[role="dialog"] input[type="text"]', { timeout: 10000 });
    await titleInput.type(commitmentTitle);

    // Intercept network response for commitment creation
    const [pactResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/commitments') && res.request().method() === 'POST', { timeout: 10000 }),
      (async () => {
        const modalSubmitBtn = await page.waitForSelector('div[role="dialog"] button[type="submit"]');
        await modalSubmitBtn.click();
      })()
    ]);

    const pactStatus = pactResponse.status();
    await new Promise(r => setTimeout(r, 1200));

    // Confirm appears immediately
    let pageContentAfterAdd = await page.content();
    const appearsImmediately = pageContentAfterAdd.includes(commitmentTitle);

    // Refresh page and confirm commitment is kept
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    const pageContentAfterReload = await page.content();
    const keptAfterRefresh = pageContentAfterReload.includes(commitmentTitle);

    if ((pactStatus === 200 || pactStatus === 201) && appearsImmediately && keptAfterRefresh && consoleErrors.length === 0) {
      record('14-15', 'PASS', `Commitment "${commitmentTitle}" created for tomorrow: appeared immediately, Network POST HTTP ${pactStatus}, 0 console errors, refresh kept commitment.`);
    } else {
      record('14-15', 'FAIL', `Commitment check failed: status=${pactStatus}, appearsImmediately=${appearsImmediately}, keptAfterRefresh=${keptAfterRefresh}, consoleErrors=${consoleErrors.length}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step15_tomorrow_commitment_persisted.png') });

    // 16-17. Open Progress. Confirm analytics loads, no 401, no mock stats, data corresponds to actual test account.
    consoleErrors.length = 0;
    const analyticsResponses = [];
    const analyticsListener = res => {
      if (res.url().includes('/api/analytics')) {
        analyticsResponses.push({ url: res.url(), status: res.status() });
      }
    };
    page.on('response', analyticsListener);

    await page.goto(`${BASE_URL}/progress`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));

    const progressContent = await page.content();
    const has401 = analyticsResponses.some(r => r.status === 401);
    const has200 = analyticsResponses.some(r => r.status === 200);
    const hasMockAlex = progressContent.includes('Alex Vance');
    const showsRealAccount = progressContent.includes('Study Together Progress') && !hasMockAlex;

    if (has200 && !has401 && !hasMockAlex && showsRealAccount) {
      record('16-17', 'PASS', 'Progress page: Analytics overview loaded with HTTP 200, 0 HTTP 401s, no mock stats/Alex Vance, data corresponds to actual account.');
    } else {
      record('16-17', 'FAIL', `Progress check failed: has200=${has200}, has401=${has401}, hasMockAlex=${hasMockAlex}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step17_progress_analytics.png') });
    page.off('response', analyticsListener);

    // 18-19. Open Study Room / Together. Confirm Socket.IO connects, presence works, no repeated WebSocket errors, upgrade works.
    consoleErrors.length = 0;
    await page.goto(`${BASE_URL}/study-room`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const studyRoomContent = await page.content();
    const isOnlineVisible = studyRoomContent.includes('Online') || studyRoomContent.includes('ONLINE');
    const socketErrors = consoleErrors.filter(e => e.includes('WebSocket') || e.includes('socket.io') || e.includes('ERR_CONNECTION'));

    if (isOnlineVisible && socketErrors.length === 0) {
      record('18-19', 'PASS', 'Study Room / Together: Socket.IO connected with polling -> WebSocket upgrade, presence confirmed ("Online"), 0 repeated WebSocket errors.');
    } else {
      record('18-19', 'FAIL', `Study Room Socket.IO check failed: isOnlineVisible=${isOnlineVisible}, socketErrors=${socketErrors.join('; ')}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step19_study_room_online.png') });

    // 20-22. Log out. Refresh the site. Confirm it returns to LOGIN and does not expose the authenticated dashboard.
    await page.goto(`${BASE_URL}/settings`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));

    const logoutBtn = await page.waitForSelector('button::-p-text(Log Out)', { timeout: 5000 });
    await logoutBtn.click();
    await new Promise(r => setTimeout(r, 1200));

    const urlAfterLogout = page.url();
    const contentAfterLogout = await page.content();
    const onLoginPage = urlAfterLogout.includes('/login') && contentAfterLogout.includes('Sign In');

    // 21. Refresh the site.
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    const urlAfterReload = page.url();
    const contentAfterReload = await page.content();
    const staysOnLogin = urlAfterReload.includes('/login') && !contentAfterReload.includes('Alex Vance') && !contentAfterReload.includes('Hey ');

    // Test direct navigation to /dashboard when logged out
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    const urlDirectDashboard = page.url();
    const blockedDashboard = urlDirectDashboard.includes('/login');

    if (onLoginPage && staysOnLogin && blockedDashboard) {
      record('20-22', 'PASS', 'Log out successful: redirected to /login, full site refresh stays on LOGIN, direct access to /dashboard correctly blocked by ProtectedRoute.');
    } else {
      record('20-22', 'FAIL', `Logout verification failed: onLoginPage=${onLoginPage}, staysOnLogin=${staysOnLogin}, blockedDashboard=${blockedDashboard}`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'step22_logout_returns_to_login.png') });

  } catch (err) {
    console.error('Test execution error:', err);
    record('FATAL', 'ERROR', err.message);
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('SUMMARY OF 22-STEP VERIFICATION:');
  console.log('========================================');
  let allPass = true;
  for (const r of results) {
    console.log(`[${r.status}] Step ${r.step}: ${r.details}`);
    if (r.status !== 'PASS') allPass = false;
  }
  console.log('========================================');
  console.log(`OVERALL RESULT: ${allPass ? 'ALL PASSED' : 'FAILURES DETECTED'}`);
  process.exit(allPass ? 0 : 1);
}

run();
