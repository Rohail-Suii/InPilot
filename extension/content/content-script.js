// LinkedBoost Content Script
// Runs on LinkedIn pages — handles DOM interaction, page detection, and action execution

(function () {
  "use strict";

  // --- Page Detection ---

  function detectPage() {
    const url = window.location.href;
    if (url.includes("/feed")) return "feed";
    if (url.includes("/jobs")) return "jobs";
    if (url.includes("/in/")) return "profile";
    if (url.includes("/messaging")) return "messaging";
    if (url.includes("/mynetwork")) return "network";
    if (url.includes("/notifications")) return "notifications";
    if (url.includes("/company")) return "company";
    if (url.includes("/groups")) return "groups";
    return "unknown";
  }

  // --- DOM Utilities ---

  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(selector);
      if (existing) {
        resolve(existing);
        return;
      }

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  }

  function getElementByText(tag, text) {
    const elements = document.querySelectorAll(tag);
    for (const el of elements) {
      if (el.textContent?.trim().includes(text)) {
        return el;
      }
    }
    return null;
  }

  // --- Action Executors ---
  // All actions use native event dispatching for anti-detection

  function dispatchNativeClick(element) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    element.dispatchEvent(
      new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
      })
    );

    element.dispatchEvent(
      new MouseEvent("mouseup", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
      })
    );

    element.dispatchEvent(
      new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: x,
        clientY: y,
      })
    );
  }

  function dispatchNativeInput(element, value) {
    // Focus the element
    element.focus();
    element.dispatchEvent(new FocusEvent("focus", { bubbles: true }));

    // Set value via native input setter
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    )?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    )?.set;

    if (element.tagName === "TEXTAREA" && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(element, value);
    } else if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, value);
    }

    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function scrollTo(y) {
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  // --- Action Handler ---

  async function handleAction(action) {
    try {
      switch (action.command) {
        case "CLICK": {
          const el = await waitForElement(action.selector);
          dispatchNativeClick(el);
          return { status: "success", actionId: action.actionId };
        }

        case "TYPE": {
          const el = await waitForElement(action.selector);
          dispatchNativeInput(el, action.value);
          return { status: "success", actionId: action.actionId };
        }

        case "SCROLL": {
          scrollTo(action.y || 0);
          return { status: "success", actionId: action.actionId };
        }

        case "GET_PAGE_INFO": {
          return {
            status: "success",
            actionId: action.actionId,
            data: {
              page: detectPage(),
              url: window.location.href,
              title: document.title,
            },
          };
        }

        case "EXTRACT_TEXT": {
          const el = await waitForElement(action.selector);
          return {
            status: "success",
            actionId: action.actionId,
            data: { text: el.textContent?.trim() },
          };
        }

        case "CHECK_ELEMENT": {
          const el = document.querySelector(action.selector);
          return {
            status: "success",
            actionId: action.actionId,
            data: { exists: !!el },
          };
        }

        default:
          return {
            status: "error",
            actionId: action.actionId,
            error: `Unknown command: ${action.command}`,
          };
      }
    } catch (e) {
      return {
        status: "error",
        actionId: action.actionId,
        error: e.message,
      };
    }
  }

  // --- SPA Navigation Detection ---

  let lastUrl = window.location.href;

  const navigationObserver = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      chrome.runtime.sendMessage({
        type: "REPORT_STATUS",
        status: "navigation",
        data: {
          page: detectPage(),
          url: currentUrl,
        },
      }).catch(() => {
        // Background script not available
      });
    }
  });

  navigationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // --- Message Listener ---

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "EXECUTE_ACTION") {
      handleAction(message)
        .then(sendResponse)
        .catch((e) =>
          sendResponse({
            status: "error",
            actionId: message.actionId,
            error: e.message,
          })
        );
      return true; // Async response
    }
  });

  // --- Init ---
  console.log("[LinkedBoost] Content script loaded on", detectPage());

  // Report initial page
  chrome.runtime.sendMessage({
    type: "REPORT_STATUS",
    status: "content_script_ready",
    data: {
      page: detectPage(),
      url: window.location.href,
    },
  }).catch(() => {
    // Background script not available
  });
})();
