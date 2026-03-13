// LinkedBoost Popup Script

const DASHBOARD_URL = "http://localhost:3000/dashboard";

const app = document.getElementById("app");

async function init() {
  const status = await getBackgroundStatus();
  const authToken = await getStoredToken();

  if (!authToken) {
    renderLoginPrompt();
    return;
  }

  renderDashboard(status);
}

function getBackgroundStatus() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "GET_STATUS" }, (response) => {
      resolve(response || { connected: false, authenticated: false });
    });
  });
}

function getStoredToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get("authToken", (result) => {
      resolve(result.authToken || null);
    });
  });
}

function saveToken(token) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ authToken: token }, () => {
      chrome.runtime.sendMessage({ type: "SET_AUTH_TOKEN", token }, () => {
        resolve(true);
      });
    });
  });
}

function clearToken() {
  return new Promise((resolve) => {
    chrome.storage.local.remove("authToken", () => {
      chrome.runtime.sendMessage({ type: "SET_AUTH_TOKEN", token: null }, () => {
        resolve(true);
      });
    });
  });
}

function renderLoginPrompt() {
  app.innerHTML = `
    <div class="login-prompt">
      <p>Paste your Extension Token from the dashboard to connect</p>
      <input class="input" id="token-input" placeholder="Extension token" />
      <button class="btn btn-primary" id="save-token">
        Save & Connect
      </button>
      <button class="btn btn-primary" id="open-dashboard">
        Open Dashboard
      </button>
    </div>
  `;

  document.getElementById("save-token").addEventListener("click", async () => {
    const input = document.getElementById("token-input");
    const token = input?.value?.trim();
    if (!token) return;
    await saveToken(token);
    setTimeout(init, 300);
  });

  document.getElementById("open-dashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: `${DASHBOARD_URL}/settings` });
  });
}

function renderDashboard(status) {
  app.innerHTML = `
    <div class="status-card">
      <div class="status-row">
        <span class="status-label">Server Connection</span>
        <span class="status-value">
          <span class="dot ${status.connected ? "green" : "red"}"></span>
          ${status.connected ? "Connected" : "Disconnected"}
        </span>
      </div>
      <div class="status-row">
        <span class="status-label">Authentication</span>
        <span class="status-value">
          <span class="dot ${status.authenticated ? "green" : "yellow"}"></span>
          ${status.authenticated ? "Verified" : "Pending"}
        </span>
      </div>
    </div>

    <div class="task-info" id="current-task" style="display: none;">
      <div class="label">Current Task</div>
      <div id="task-text">Idle</div>
    </div>

    <button class="btn btn-primary" id="open-dashboard">
      Open Dashboard
    </button>

    ${!status.connected ? `
      <button class="btn btn-outline" id="reconnect">
        Reconnect
      </button>
    ` : ""}

    <button class="btn btn-outline" id="change-token">
      Change Token
    </button>
  `;

  document.getElementById("open-dashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  });

  const reconnectBtn = document.getElementById("reconnect");
  if (reconnectBtn) {
    reconnectBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "CONNECT" });
      setTimeout(init, 1000);
    });
  }

  const changeTokenBtn = document.getElementById("change-token");
  if (changeTokenBtn) {
    changeTokenBtn.addEventListener("click", async () => {
      await clearToken();
      setTimeout(init, 100);
    });
  }
}

// Listen for status changes from background
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CONNECTION_STATUS") {
    init();
  }
});

init();
