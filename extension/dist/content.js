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

        // --- Phase 2: Job Scraping ---
        case "SCRAPE_JOB_LISTINGS": {
          const jobs = scrapeJobListings();
          return {
            status: "success",
            actionId: action.actionId,
            data: { jobs },
          };
        }

        case "SCRAPE_JOB_DETAIL": {
          const detail = scrapeJobDetail();
          return {
            status: "success",
            actionId: action.actionId,
            data: { detail },
          };
        }

        // --- Phase 2: Easy Apply Form Filling ---
        case "CLICK_EASY_APPLY": {
          const result = await clickEasyApply();
          return { status: "success", actionId: action.actionId, data: result };
        }

        case "GET_FORM_FIELDS": {
          const fields = getFormFields();
          return {
            status: "success",
            actionId: action.actionId,
            data: { fields },
          };
        }

        case "FILL_FORM_FIELD": {
          await fillFormField(action.fieldIndex, action.value, action.fieldType);
          return { status: "success", actionId: action.actionId };
        }

        case "CLICK_NEXT_OR_SUBMIT": {
          const nextResult = await clickNextOrSubmit();
          return {
            status: "success",
            actionId: action.actionId,
            data: nextResult,
          };
        }

        case "UPLOAD_RESUME": {
          const uploadResult = await uploadResume(action.fileData, action.fileName);
          return {
            status: "success",
            actionId: action.actionId,
            data: uploadResult,
          };
        }

        // --- Phase 2: Post Creation ---
        case "CREATE_POST": {
          const postResult = await createLinkedInPost(action.content, action.hashtags);
          return {
            status: "success",
            actionId: action.actionId,
            data: postResult,
          };
        }

        // --- Phase 2: Engagement ---
        case "LIKE_POST": {
          const likeResult = await likePost(action.selector);
          return {
            status: "success",
            actionId: action.actionId,
            data: likeResult,
          };
        }

        case "COMMENT_ON_POST": {
          const commentResult = await commentOnPost(action.selector, action.comment);
          return {
            status: "success",
            actionId: action.actionId,
            data: commentResult,
          };
        }

        case "NAVIGATE": {
          window.location.href = action.url;
          return { status: "success", actionId: action.actionId };
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

  // --- Phase 2: Job Scraping Helpers ---

  function scrapeJobListings() {
    const jobCards = document.querySelectorAll(
      ".jobs-search-results__list-item, .job-card-container, .scaffold-layout__list-item"
    );
    const jobs = [];

    for (const card of jobCards) {
      const titleEl =
        card.querySelector(".job-card-list__title, .job-card-container__link") ||
        card.querySelector("a[data-control-name]");
      const companyEl = card.querySelector(
        ".job-card-container__primary-description, .artdeco-entity-lockup__subtitle"
      );
      const locationEl = card.querySelector(
        ".job-card-container__metadata-item, .artdeco-entity-lockup__caption"
      );
      const easyApplyBadge = card.querySelector(
        ".job-card-container__apply-method, [data-test-job-card-easy-apply]"
      );

      const title = titleEl?.textContent?.trim() || "";
      const url = titleEl?.closest("a")?.href || "";
      const jobId = url.match(/\/view\/(\d+)/)?.[1] || "";

      if (title) {
        jobs.push({
          title,
          company: companyEl?.textContent?.trim() || "",
          location: locationEl?.textContent?.trim() || "",
          easyApply: !!easyApplyBadge,
          url,
          jobId,
        });
      }
    }

    return jobs;
  }

  function scrapeJobDetail() {
    const titleEl = document.querySelector(
      ".jobs-unified-top-card__job-title, .job-details-jobs-unified-top-card__job-title, h1.t-24"
    );
    const companyEl = document.querySelector(
      ".jobs-unified-top-card__company-name, .job-details-jobs-unified-top-card__company-name"
    );
    const locationEl = document.querySelector(
      ".jobs-unified-top-card__bullet, .job-details-jobs-unified-top-card__bullet"
    );
    const descriptionEl = document.querySelector(
      ".jobs-description__content, .jobs-box__html-content, #job-details"
    );
    const salaryEl = document.querySelector(
      ".jobs-unified-top-card__job-insight--highlight, .salary-main-rail__data-amount"
    );

    return {
      title: titleEl?.textContent?.trim() || "",
      company: companyEl?.textContent?.trim() || "",
      location: locationEl?.textContent?.trim() || "",
      description: descriptionEl?.textContent?.trim() || "",
      salary: salaryEl?.textContent?.trim() || "",
      url: window.location.href,
    };
  }

  // --- Phase 2: Easy Apply Helpers ---

  async function clickEasyApply() {
    const btn =
      document.querySelector(".jobs-apply-button") ||
      getElementByText("button", "Easy Apply") ||
      getElementByText("button", "Apply");

    if (!btn) {
      return { clicked: false, error: "Easy Apply button not found" };
    }

    dispatchNativeClick(btn);
    // Wait for modal to appear
    await new Promise((r) => setTimeout(r, 1500));
    return { clicked: true };
  }

  function getFormFields() {
    const modal =
      document.querySelector(".jobs-easy-apply-modal") ||
      document.querySelector("[data-test-modal]") ||
      document.querySelector(".artdeco-modal");

    if (!modal) return [];

    const fields = [];

    // Text inputs
    const inputs = modal.querySelectorAll("input[type='text'], input[type='number'], input[type='tel'], input[type='email'], input[type='url']");
    for (const input of inputs) {
      const label = input.closest(".fb-dash-form-element")?.querySelector("label")?.textContent?.trim() ||
        input.getAttribute("aria-label") || input.getAttribute("placeholder") || "";
      fields.push({
        type: "text",
        label,
        value: input.value,
        selector: buildSelector(input),
        required: input.required || input.getAttribute("aria-required") === "true",
      });
    }

    // Textareas
    const textareas = modal.querySelectorAll("textarea");
    for (const ta of textareas) {
      const label = ta.closest(".fb-dash-form-element")?.querySelector("label")?.textContent?.trim() ||
        ta.getAttribute("aria-label") || "";
      fields.push({
        type: "textarea",
        label,
        value: ta.value,
        selector: buildSelector(ta),
        required: ta.required,
      });
    }

    // Selects (dropdowns)
    const selects = modal.querySelectorAll("select");
    for (const sel of selects) {
      const label = sel.closest(".fb-dash-form-element")?.querySelector("label")?.textContent?.trim() ||
        sel.getAttribute("aria-label") || "";
      const options = Array.from(sel.options).map((o) => ({
        value: o.value,
        text: o.textContent?.trim() || "",
      }));
      fields.push({
        type: "select",
        label,
        value: sel.value,
        options,
        selector: buildSelector(sel),
        required: sel.required,
      });
    }

    // Radio buttons
    const radioGroups = modal.querySelectorAll("fieldset, [role='radiogroup']");
    for (const group of radioGroups) {
      const legend = group.querySelector("legend, .fb-dash-form-element__label")?.textContent?.trim() || "";
      const radios = group.querySelectorAll("input[type='radio']");
      const options = Array.from(radios).map((r) => ({
        value: r.value,
        label: r.closest("label")?.textContent?.trim() || r.nextElementSibling?.textContent?.trim() || "",
        selector: buildSelector(r),
      }));
      if (options.length > 0) {
        fields.push({
          type: "radio",
          label: legend,
          options,
          value: group.querySelector("input[type='radio']:checked")?.value || "",
        });
      }
    }

    // File inputs
    const fileInputs = modal.querySelectorAll("input[type='file']");
    for (const fi of fileInputs) {
      const label = fi.closest(".fb-dash-form-element")?.querySelector("label")?.textContent?.trim() ||
        fi.getAttribute("aria-label") || "Resume/CV Upload";
      fields.push({
        type: "file",
        label,
        selector: buildSelector(fi),
      });
    }

    return fields;
  }

  function buildSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.name) return `[name="${element.name}"]`;
    // Build a path selector
    const path = [];
    let current = element;
    while (current && current !== document.body) {
      let sel = current.tagName.toLowerCase();
      if (current.id) {
        sel = `#${current.id}`;
        path.unshift(sel);
        break;
      }
      const parent = current.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (c) => c.tagName === current.tagName
        );
        if (siblings.length > 1) {
          const idx = siblings.indexOf(current) + 1;
          sel += `:nth-of-type(${idx})`;
        }
      }
      path.unshift(sel);
      current = parent;
    }
    return path.join(" > ");
  }

  async function fillFormField(fieldIndex, value, fieldType) {
    const modal =
      document.querySelector(".jobs-easy-apply-modal") ||
      document.querySelector("[data-test-modal]") ||
      document.querySelector(".artdeco-modal");
    if (!modal) throw new Error("Application modal not found");

    if (fieldType === "select") {
      const selects = modal.querySelectorAll("select");
      const sel = selects[fieldIndex];
      if (sel) {
        sel.value = value;
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    } else if (fieldType === "radio") {
      // Use CSS.escape to prevent selector injection
      const escapedValue = CSS.escape(value);
      const radios = modal.querySelectorAll(`input[type='radio'][value='${escapedValue}']`);
      if (radios.length > 0) {
        dispatchNativeClick(radios[0]);
      }
    } else {
      // Text input or textarea
      const inputs = modal.querySelectorAll("input[type='text'], input[type='number'], input[type='tel'], input[type='email'], input[type='url'], textarea");
      const input = inputs[fieldIndex];
      if (input) {
        dispatchNativeInput(input, value);
      }
    }
  }

  async function clickNextOrSubmit() {
    const modal =
      document.querySelector(".jobs-easy-apply-modal") ||
      document.querySelector("[data-test-modal]") ||
      document.querySelector(".artdeco-modal");
    if (!modal) return { action: "none", error: "Modal not found" };

    // Look for Submit button first
    const submitBtn =
      getElementByText("button", "Submit application") ||
      modal.querySelector("[aria-label='Submit application']");
    if (submitBtn) {
      dispatchNativeClick(submitBtn);
      await new Promise((r) => setTimeout(r, 2000));
      return { action: "submitted" };
    }

    // Look for Review button
    const reviewBtn = getElementByText("button", "Review");
    if (reviewBtn) {
      dispatchNativeClick(reviewBtn);
      await new Promise((r) => setTimeout(r, 1000));
      return { action: "review" };
    }

    // Look for Next button
    const nextBtn =
      getElementByText("button", "Next") ||
      modal.querySelector("[aria-label='Continue to next step']");
    if (nextBtn) {
      dispatchNativeClick(nextBtn);
      await new Promise((r) => setTimeout(r, 1000));
      return { action: "next" };
    }

    return { action: "none", error: "No next/submit button found" };
  }

  async function uploadResume(fileDataB64, fileName) {
    const modal =
      document.querySelector(".jobs-easy-apply-modal") ||
      document.querySelector("[data-test-modal]") ||
      document.querySelector(".artdeco-modal");
    if (!modal) return { uploaded: false, error: "Modal not found" };

    const fileInput = modal.querySelector("input[type='file']");
    if (!fileInput) return { uploaded: false, error: "File input not found" };

    // Convert base64 to File
    const byteChars = atob(fileDataB64);
    const byteArr = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteArr[i] = byteChars.charCodeAt(i);
    }
    const file = new File([byteArr], fileName || "resume.pdf", {
      type: "application/pdf",
    });

    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));

    await new Promise((r) => setTimeout(r, 2000));
    return { uploaded: true };
  }

  // --- Phase 2: Post Creation Helper ---

  async function createLinkedInPost(content, hashtags) {
    // Navigate to feed if not already there
    if (!window.location.href.includes("/feed")) {
      window.location.href = "https://www.linkedin.com/feed/";
      await new Promise((r) => setTimeout(r, 3000));
    }

    // Click "Start a post" button
    const startPostBtn =
      document.querySelector(".share-box-feed-entry__trigger") ||
      getElementByText("button", "Start a post");
    if (!startPostBtn) return { posted: false, error: "Start a post button not found" };

    dispatchNativeClick(startPostBtn);
    await new Promise((r) => setTimeout(r, 2000));

    // Find the post editor
    const editor =
      document.querySelector(".ql-editor") ||
      document.querySelector("[role='textbox'][contenteditable='true']") ||
      document.querySelector("[data-test-ql-editor-contenteditable]");

    if (!editor) return { posted: false, error: "Post editor not found" };

    // Type content with hashtags
    let fullContent = content;
    if (hashtags && hashtags.length > 0) {
      fullContent += "\n\n" + hashtags.map((h) => `#${h}`).join(" ");
    }

    editor.focus();
    // Use execCommand for rich text editors
    document.execCommand("insertText", false, fullContent);
    editor.dispatchEvent(new Event("input", { bubbles: true }));

    await new Promise((r) => setTimeout(r, 1000));

    // Click Post button
    const postBtn =
      getElementByText("button", "Post") ||
      document.querySelector(".share-actions__primary-action");
    if (!postBtn) return { posted: false, error: "Post button not found", content: fullContent };

    dispatchNativeClick(postBtn);
    await new Promise((r) => setTimeout(r, 3000));

    return { posted: true, content: fullContent };
  }

  // --- Phase 2: Engagement Helpers ---

  async function likePost(postSelector) {
    const post = postSelector
      ? document.querySelector(postSelector)
      : null;
    const likeBtn = post
      ? post.querySelector("[data-test-action='like'], button[aria-label*='Like']")
      : document.querySelector("[data-test-action='like'], button[aria-label*='Like']");

    if (!likeBtn) return { liked: false, error: "Like button not found" };

    // Check if already liked
    const isLiked = likeBtn.getAttribute("aria-pressed") === "true" ||
      likeBtn.classList.contains("react-button--active");
    if (isLiked) return { liked: false, alreadyLiked: true };

    dispatchNativeClick(likeBtn);
    await new Promise((r) => setTimeout(r, 500));
    return { liked: true };
  }

  async function commentOnPost(postSelector, commentText) {
    const post = postSelector
      ? document.querySelector(postSelector)
      : null;

    // Click comment button to open comment box
    const commentBtn = post
      ? post.querySelector("button[aria-label*='Comment'], button[aria-label*='comment']")
      : document.querySelector("button[aria-label*='Comment'], button[aria-label*='comment']");

    if (!commentBtn) return { commented: false, error: "Comment button not found" };
    dispatchNativeClick(commentBtn);
    await new Promise((r) => setTimeout(r, 1500));

    // Find comment input
    const commentInput =
      document.querySelector(".comments-comment-box__form .ql-editor") ||
      document.querySelector("[role='textbox'][aria-label*='comment']");

    if (!commentInput) return { commented: false, error: "Comment input not found" };

    commentInput.focus();
    document.execCommand("insertText", false, commentText);
    commentInput.dispatchEvent(new Event("input", { bubbles: true }));

    await new Promise((r) => setTimeout(r, 1000));

    // Submit comment
    const submitBtn =
      getElementByText("button", "Post") ||
      document.querySelector(".comments-comment-box__submit-button");

    if (submitBtn) {
      dispatchNativeClick(submitBtn);
      await new Promise((r) => setTimeout(r, 1500));
      return { commented: true };
    }

    return { commented: false, error: "Submit button not found" };
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
