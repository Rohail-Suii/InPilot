// LinkedBoost Background Service Worker
// Handles WebSocket connection to the web app and relays commands to content scripts

import { io } from "./socket.io.esm.min.js";

const DEFAULT_WS_URL = "http://localhost:3001";
const HEARTBEAT_INTERVAL = 30000;
const RECONNECT_BASE_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

let socket = null;
let heartbeatTimer = null;
let reconnectAttempts = 0;
let reconnectTimer = null;
let authToken = null;
let commandQueue = [];
let wsUrl = DEFAULT_WS_URL;

function normalizeWsUrl(url) {
  if (url.startsWith("ws://")) return `http://${url.slice(5)}`;
  if (url.startsWith("wss://")) return `https://${url.slice(6)}`;
  return url;
}

// Load WebSocket URL from storage
chrome.storage.local.get("wsUrl", (result) => {
  if (result.wsUrl) {
    wsUrl = normalizeWsUrl(result.wsUrl);
  }
});

// --- WebSocket Connection ---

function connect() {
  if (socket && socket.connected) return;

  try {
    if (socket) {
      socket.removeAllListeners();
      socket.disconnect();
    }

    socket = io(`${normalizeWsUrl(wsUrl)}/extension`, {
      path: "/api/ws",
      transports: ["websocket", "polling"],
      reconnection: false,
    });

    socket.on("connect", () => {
      console.log("[LinkedBoost] WebSocket connected");
      reconnectAttempts = 0;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      updateConnectionStatus(true);
      startHeartbeat();

      // Authenticate if we have a token
      if (authToken) {
        socket.emit("AUTH", { token: authToken });
      }

      // Flush command queue
      while (commandQueue.length > 0) {
        const cmd = commandQueue.shift();
        sendToServer(cmd);
      }
    });

    socket.on("EXECUTE_ACTION", (message) => {
      handleServerMessage({ type: "EXECUTE_ACTION", ...message });
    });

    socket.on("SYNC_CONFIG", (data) => {
      handleServerMessage({ type: "SYNC_CONFIG", data });
    });

    socket.on("AUTH_SUCCESS", (data) => {
      handleServerMessage({ type: "AUTH_SUCCESS", ...data });
    });

    socket.on("AUTH_FAILURE", (data) => {
      handleServerMessage({ type: "AUTH_FAILURE", ...data });
    });

    socket.on("disconnect", () => {
      console.log("[LinkedBoost] WebSocket disconnected");
      updateConnectionStatus(false);
      stopHeartbeat();
      scheduleReconnect();
    });

    socket.on("connect_error", (error) => {
      console.error("[LinkedBoost] WebSocket error:", error);
      updateConnectionStatus(false);
      stopHeartbeat();
      scheduleReconnect();
    });
  } catch (e) {
    console.error("[LinkedBoost] Failed to create WebSocket:", e);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  const delay = Math.min(
    RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts),
    MAX_RECONNECT_DELAY
  );
  reconnectAttempts++;
  console.log(`[LinkedBoost] Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connect();
  }, delay);
}

function startHeartbeat() {
  stopHeartbeat();
  heartbeatTimer = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit("HEARTBEAT", { timestamp: Date.now() });
    }
  }, HEARTBEAT_INTERVAL);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// --- Message Handling ---

function handleServerMessage(message) {
  switch (message.type) {
    case "EXECUTE_ACTION":
      forwardToContentScript(message);
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
      console.log("[LinkedBoost] Unknown message type:", message.type);
  }
}

async function forwardToContentScript(message) {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      url: "https://www.linkedin.com/*",
    });

    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, message, (response) => {
        if (response) {
          sendToServer({ type: "REPORT_STATUS", ...response });
        }
      });
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
  if (socket && socket.connected) {
    if (message.type === "REPORT_STATUS") {
      socket.emit("REPORT_STATUS", {
        event: "task:progress",
        payload: message,
      });
      return;
    }

    socket.emit(message.type || "MESSAGE", message);
  } else {
    commandQueue.push(message);
    if (commandQueue.length > 100) {
      commandQueue.shift(); // Drop oldest
    }
  }
}

// --- Connection Status ---

function updateConnectionStatus(connected) {
  chrome.storage.local.set({ isConnected: connected });
  // Notify popup
  chrome.runtime.sendMessage({
    type: "CONNECTION_STATUS",
    connected,
  }).catch(() => {
    // Popup not open, ignore
  });
}

// --- Message Listener (from content script & popup) ---

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "SET_AUTH_TOKEN":
      authToken = message.token;
      chrome.storage.local.set({ authToken: message.token });
      if (socket && socket.connected) {
        socket.emit("AUTH", { token: authToken });
      }
      sendResponse({ success: true });
      break;

    case "SET_WS_URL":
      wsUrl = normalizeWsUrl(message.url);
      chrome.storage.local.set({ wsUrl });
      // Reconnect with new URL
      if (socket) {
        socket.disconnect();
      }
      reconnectAttempts = 0;
      connect();
      sendResponse({ success: true });
      break;

    case "GET_STATUS":
      sendResponse({
        connected: socket?.connected ?? false,
        authenticated: !!authToken,
      });
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
  return true; // Keep channel open for async response
});

// --- Initialization ---

chrome.storage.local.get("authToken", (result) => {
  if (result.authToken) {
    authToken = result.authToken;
  }
  connect();
});

// Periodic reconnect check via alarm
chrome.alarms.create("reconnect-check", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "reconnect-check") {
    if (!socket || !socket.connected) {
      connect();
    }
  }
});
