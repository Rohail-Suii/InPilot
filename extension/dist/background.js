// LinkedBoost Background Service Worker
// Handles WebSocket connection to the web app, relays commands to content scripts,
// and drives the full job automation loop.

const DEFAULT_WS_URL = "ws://localhost:3001";
const DEFAULT_API_URL = "http://localhost:3000";
const HEARTBEAT_INTERVAL = 30000;
const RECONNECT_BASE_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

let ws = null;
let heartbeatTimer = null;
let reconnectAttempts = 0;
let authToken = null;
let commandQueue = [];
let wsUrl = DEFAULT_WS_URL;
let apiUrl = DEFAULT_API_URL;

// Automation state
let automationRunning = false;
let automationAborted = false;

// Load settings from storage
chrome.storage.local.get(["wsUrl", "apiUrl"], (result) => {
  if (result.wsUrl) wsUrl = result.wsUrl;
  if (result.apiUrl) apiUrl = result.apiUrl;
});

// ─── WebSocket Connection ─────────────────────────────

function connect() {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  try {
    ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("[LinkedBoost] WebSocket connected");
      reconnectAttempts = 0;
      updateConnectionStatus(true);
      startHeartbeat();

      if (authToken) {
        ws.send(JSON.stringify({ type: "AUTH", token: authToken }));
      }

      while (commandQueue.length > 0) {
        const cmd = commandQueue.shift();
        ws.send(JSON.stringify(cmd));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleServerMessage(message);
      } catch (e) {
        console.error("[LinkedBoost] Failed to parse message:", e);
      }
    };

    ws.onclose = () => {
      console.log("[LinkedBoost] WebSocket disconnected");
      updateConnectionStatus(false);
      stopHeartbeat();
      scheduleReconnect();
    };

    ws.onerror = (error) => {
      console.error("[LinkedBoost] WebSocket error:", error);
    };
  } catch (e) {
    console.error("[LinkedBoost] Failed to create WebSocket:", e);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  const delay = Math.min(
    RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts),
    MAX_RECONNECT_DELAY
  );
  reconnectAttempts++;
  setTimeout(connect, delay);
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "HEARTBEAT", timestamp: Date.now() }));
    }
  }, HEARTBEAT_INTERVAL);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// ─── Message Handling ───────────────────────────────────

function handleServerMessage(message) {
  switch (message.type) {
    case "EXECUTE_ACTION":
      forwardToContentScript(message);
      break;
    case "START_AUTOMATION":
      startAutomation(message.searchId);
      break;
    case "STOP_AUTOMATION":
      stopAutomation();
      break;
    case "SYNC_CONFIG":
      chrome.storage.local.set({ config: message.data });
      break;
    case "AUTH_SUCCESS":
      console.log("[LinkedBoost] Authenticated successfully");
      break;
    case "AUTH_FAILURE":
      console.error("[LinkedBoost] Authentication failed");
      authToken = null;
      chrome.storage.local.remove("authToken");
      break;
    default:
      break;
  }
}

// ─── Content Script Communication ───────────────────────

function getLinkedInTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: "https://www.linkedin.com/*" }, (tabs) => {
      resolve(tabs && tabs.length > 0 ? tabs[0] : null);
    });
  });
}

function ensureLinkedInTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ url: "https://www.linkedin.com/*" }, (tabs) => {
      if (tabs && tabs.length > 0) {
        resolve(tabs[0]);
      } else {
        chrome.tabs.create({ url: "https://www.linkedin.com/feed/", active: false }, (tab) => {
          setTimeout(() => resolve(tab), 4000);
        });
      }
    });
  });
}

function sendToContentScript(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(response);
      }
    });
  });
}

async function forwardToContentScript(message) {
  try {
    const tab = await getLinkedInTab();
    if (tab?.id) {
      const response = await sendToContentScript(tab.id, message);
      if (response) {
        sendToServer({ type: "REPORT_STATUS", ...response });
      }
    } else {
      sendToServer({
        type: "REPORT_STATUS",
        status: "error",
        error: "No active LinkedIn tab found",
        actionId: message.actionId,
      });
    }
  } catch (e) {
    console.error("[LinkedBoost] Failed to forward to content script:", e);
  }
}

function sendToServer(message) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  } else {
    commandQueue.push(message);
    if (commandQueue.length > 100) commandQueue.shift();
  }
}

// ─── API Communication ──────────────────────────────────

async function apiCall(endpoint, body) {
  const res = await fetch(`${apiUrl}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-auth-token": authToken,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `API error ${res.status}`);
  }

  return res.json();
}

// ─── Human-like Delays ──────────────────────────────────

function randomDelay(min, max) {
  const mean = (min + max) / 2;
  const stdDev = (max - min) / 6;
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const delay = Math.max(min, Math.min(max, Math.round(mean + z * stdDev)));
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// ─── Job Automation Engine ──────────────────────────────

function reportProgress(event, data) {
  sendToServer({
    type: "REPORT_STATUS",
    event,
    ...data,
  });

  // Also notify popup
  chrome.runtime.sendMessage({
    type: "AUTOMATION_PROGRESS",
    event,
    ...data,
  }).catch(() => {});
}

async function startAutomation(searchId) {
  if (automationRunning) {
    reportProgress("task:error", { message: "Automation already running" });
    return;
  }

  automationRunning = true;
  automationAborted = false;

  chrome.storage.local.set({ automationRunning: true, automationSearchId: searchId });

  reportProgress("task:start", { label: "Starting job automation..." });

  try {
    // Step 1: Get search config and navigate to LinkedIn Jobs
    reportProgress("task:progress", { message: "Fetching search configuration..." });
    const startData = await apiCall(`/api/jobs/automate?step=start`, { searchId });

    if (!startData.url) {
      throw new Error("No search URL returned");
    }

    reportProgress("task:progress", {
      message: `Navigating to LinkedIn Jobs (${startData.remaining} applications remaining today)...`,
    });

    // Navigate to search URL
    const tab = await ensureLinkedInTab();
    await chrome.tabs.update(tab.id, { url: startData.url, active: true });
    await randomDelay(4000, 6000);

    if (automationAborted) return cleanup("Automation stopped by user");

    // Step 2: Scrape job listings
    reportProgress("task:progress", { message: "Scraping job listings..." });
    await randomDelay(2000, 3000);

    const scrapeResult = await sendToContentScript(tab.id, {
      type: "EXECUTE_ACTION",
      command: "SCRAPE_JOB_LISTINGS",
      actionId: "scrape-listings",
    });

    const scrapedJobs = scrapeResult?.data?.jobs || [];
    if (scrapedJobs.length === 0) {
      throw new Error("No jobs found on the search results page");
    }

    reportProgress("job:found", {
      message: `Found ${scrapedJobs.length} jobs, getting details...`,
      count: scrapedJobs.length,
    });

    // Step 2b: Get details for each job
    const jobsWithDetails = [];
    for (let i = 0; i < Math.min(scrapedJobs.length, 10); i++) {
      if (automationAborted) return cleanup("Automation stopped by user");

      const job = scrapedJobs[i];
      if (!job.url) continue;

      await chrome.tabs.update(tab.id, { url: job.url });
      await randomDelay(2000, 4000);

      try {
        const detailResult = await sendToContentScript(tab.id, {
          type: "EXECUTE_ACTION",
          command: "SCRAPE_JOB_DETAIL",
          actionId: `detail-${i}`,
        });

        const detail = detailResult?.data?.detail;
        if (detail?.description) {
          jobsWithDetails.push({
            ...job,
            title: detail.title || job.title,
            company: detail.company || job.company,
            description: detail.description,
          });
        }
      } catch (err) {
        console.warn(`[LinkedBoost] Failed to scrape job detail: ${err.message}`);
      }

      await randomDelay(1000, 2500);
    }

    if (jobsWithDetails.length === 0) {
      throw new Error("Could not get job details for any listings");
    }

    reportProgress("task:progress", {
      message: `Got details for ${jobsWithDetails.length} jobs, scoring with AI...`,
    });

    // Step 3: Send to server for AI scoring
    const processResult = await apiCall(`/api/jobs/automate?step=process-jobs`, {
      jobs: jobsWithDetails,
      searchId,
    });

    const qualifyingApps = processResult.applications || [];
    if (qualifyingApps.length === 0) {
      reportProgress("task:complete", {
        message: `Processed ${jobsWithDetails.length} jobs but none matched your profile (score >= 60%). Try broadening your search.`,
      });
      return cleanup();
    }

    reportProgress("task:progress", {
      message: `${qualifyingApps.length} jobs match your profile! Starting applications...`,
    });

    // Step 4: Apply to each qualifying job
    let appliedCount = 0;
    let failedCount = 0;

    for (const app of qualifyingApps) {
      if (automationAborted) return cleanup("Automation stopped by user");

      reportProgress("job:applying", {
        message: `Preparing application for ${app.jobTitle} at ${app.company} (${app.matchScore}% match)...`,
        jobTitle: app.jobTitle,
        company: app.company,
      });

      try {
        // 4a: Tailor resume + generate PDF
        const prepData = await apiCall(`/api/jobs/automate?step=prepare-apply`, {
          applicationId: app._id,
        });

        // 4b: Navigate to job page
        await chrome.tabs.update(tab.id, { url: app.jobUrl });
        await randomDelay(3000, 5000);

        if (automationAborted) return cleanup("Automation stopped by user");

        // 4c: Click Easy Apply
        const easyApplyResult = await sendToContentScript(tab.id, {
          type: "EXECUTE_ACTION",
          command: "CLICK_EASY_APPLY",
          actionId: `apply-${app._id}`,
        });

        if (!easyApplyResult?.data?.clicked) {
          throw new Error("Easy Apply button not found");
        }

        await randomDelay(1500, 2500);

        // 4d: Fill form pages
        let formPage = 0;
        const MAX_FORM_PAGES = 8;
        let submitted = false;

        while (formPage < MAX_FORM_PAGES) {
          if (automationAborted) return cleanup("Automation stopped by user");

          const fieldsResult = await sendToContentScript(tab.id, {
            type: "EXECUTE_ACTION",
            command: "GET_FORM_FIELDS",
            actionId: `fields-${formPage}`,
          });

          const fields = fieldsResult?.data?.fields || [];

          if (fields.length > 0) {
            // Upload resume if file field exists
            const fileField = fields.find((f) => f.type === "file");
            if (fileField && prepData.resumePdf) {
              await sendToContentScript(tab.id, {
                type: "EXECUTE_ACTION",
                command: "UPLOAD_RESUME",
                actionId: `upload-${formPage}`,
                fileData: prepData.resumePdf,
                fileName: prepData.resumeFileName,
              });
              await randomDelay(2000, 3000);
            }

            // Get AI answers for empty fields
            const answerableFields = fields.filter(
              (f) => f.type !== "file" && f.label && !f.value
            );

            if (answerableFields.length > 0) {
              const answersData = await apiCall(`/api/jobs/automate?step=answer-form`, {
                questions: answerableFields,
                applicationId: app._id,
              });

              const answers = answersData.answers || [];

              for (let fi = 0; fi < answers.length; fi++) {
                if (automationAborted) return cleanup("Automation stopped by user");

                const answer = answers[fi];
                if (!answer.answer) continue;

                const originalField = fields.find((f) => f.label === answer.question);
                const originalIndex = fields.indexOf(originalField);
                if (originalIndex < 0) continue;

                await sendToContentScript(tab.id, {
                  type: "EXECUTE_ACTION",
                  command: "FILL_FORM_FIELD",
                  actionId: `fill-${formPage}-${fi}`,
                  fieldIndex: originalIndex,
                  value: answer.answer,
                  fieldType: originalField.type,
                });

                await randomDelay(300, 800);
              }
            }
          }

          // Click Next / Review / Submit
          await randomDelay(500, 1000);
          const navResult = await sendToContentScript(tab.id, {
            type: "EXECUTE_ACTION",
            command: "CLICK_NEXT_OR_SUBMIT",
            actionId: `nav-${formPage}`,
          });

          const action = navResult?.data?.action;

          if (action === "submitted") {
            submitted = true;
            await apiCall(`/api/jobs/automate?step=complete`, {
              applicationId: app._id,
              success: true,
              notes: "Auto-applied via LinkedBoost",
            });

            appliedCount++;
            reportProgress("job:applied", {
              message: `Applied to ${app.jobTitle} at ${app.company}!`,
              jobTitle: app.jobTitle,
              company: app.company,
              appliedCount,
            });
            break;
          } else if (action === "next" || action === "review") {
            formPage++;
            await randomDelay(1000, 2000);
          } else {
            throw new Error(`Form navigation stuck on page ${formPage + 1}`);
          }
        }

        if (!submitted) {
          throw new Error("Too many form pages");
        }

        // Cooldown between applications (5-10 min)
        if (qualifyingApps.indexOf(app) < qualifyingApps.length - 1) {
          const cooldownMs = Math.round(300000 + Math.random() * 300000);
          const cooldownMins = Math.round(cooldownMs / 60000);

          reportProgress("task:progress", {
            message: `Waiting ${cooldownMins} min before next application (anti-detection)...`,
          });

          await new Promise((resolve) => {
            const timer = setTimeout(resolve, cooldownMs);
            const check = setInterval(() => {
              if (automationAborted) {
                clearTimeout(timer);
                clearInterval(check);
                resolve();
              }
            }, 1000);
          });
        }
      } catch (err) {
        console.error(`[LinkedBoost] Failed to apply to ${app.jobTitle}:`, err);
        failedCount++;

        await apiCall(`/api/jobs/automate?step=complete`, {
          applicationId: app._id,
          success: false,
          notes: `Auto-apply failed: ${err.message}`,
        }).catch(() => {});

        reportProgress("task:error", {
          message: `Failed: ${app.jobTitle} — ${err.message}`,
          jobTitle: app.jobTitle,
        });

        await randomDelay(2000, 4000);
      }
    }

    reportProgress("task:complete", {
      message: `Automation complete! Applied: ${appliedCount}, Failed: ${failedCount}`,
      appliedCount,
      failedCount,
    });
  } catch (err) {
    console.error("[LinkedBoost] Automation error:", err);
    reportProgress("task:error", {
      message: `Automation failed: ${err.message}`,
    });
  }

  cleanup();
}

function stopAutomation() {
  automationAborted = true;
  reportProgress("task:progress", { message: "Stopping automation..." });
}

function cleanup(message) {
  automationRunning = false;
  automationAborted = false;
  chrome.storage.local.set({ automationRunning: false, automationSearchId: null });
  if (message) {
    reportProgress("task:complete", { message });
  }
}

// ─── Connection Status ──────────────────────────────────

function updateConnectionStatus(connected) {
  chrome.storage.local.set({ isConnected: connected });
  chrome.runtime.sendMessage({
    type: "CONNECTION_STATUS",
    connected,
  }).catch(() => {});
}

// ─── Message Listener (from content script & popup) ─────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "SET_AUTH_TOKEN":
      authToken = message.token;
      chrome.storage.local.set({ authToken: message.token });
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "AUTH", token: authToken }));
      }
      sendResponse({ success: true });
      break;

    case "SET_WS_URL":
      wsUrl = message.url;
      chrome.storage.local.set({ wsUrl: message.url });
      if (ws) ws.close();
      reconnectAttempts = 0;
      connect();
      sendResponse({ success: true });
      break;

    case "SET_API_URL":
      apiUrl = message.url;
      chrome.storage.local.set({ apiUrl: message.url });
      sendResponse({ success: true });
      break;

    case "GET_STATUS":
      sendResponse({
        connected: ws?.readyState === WebSocket.OPEN,
        authenticated: !!authToken,
        automationRunning,
      });
      break;

    case "START_AUTOMATION":
      startAutomation(message.searchId);
      sendResponse({ success: true });
      break;

    case "STOP_AUTOMATION":
      stopAutomation();
      sendResponse({ success: true });
      break;

    case "REPORT_STATUS":
      sendToServer(message);
      sendResponse({ success: true });
      break;

    case "CONNECT":
      connect();
      sendResponse({ success: true });
      break;

    default:
      sendResponse({ error: "Unknown message type" });
  }
  return true;
});

// ─── Initialization ─────────────────────────────────────

chrome.storage.local.get(["authToken", "apiUrl"], (result) => {
  if (result.authToken) authToken = result.authToken;
  if (result.apiUrl) apiUrl = result.apiUrl;
  connect();
});

// Periodic reconnect check
chrome.alarms.create("reconnect-check", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "reconnect-check") {
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      connect();
    }
  }
});
