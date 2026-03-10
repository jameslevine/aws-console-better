/**
 * AWS Console Better — Content Script
 *
 * Runs in both the main AWS Console frame AND inside EC2 iframes.
 * Injects features directly into the AWS Console UI.
 */

const IS_TOP_FRAME = window === window.top;
const ACB_MARKER = "acb-injected";

if (document.documentElement.getAttribute(ACB_MARKER)) {
  // Already injected
} else {
  document.documentElement.setAttribute(ACB_MARKER, "true");
  init();
}

function init(): void {
  if (IS_TOP_FRAME) {
    console.log("AWS Console Better — Main frame loaded");
    // Main frame: watch for hash changes to detect page navigation
  } else {
    console.log("AWS Console Better — Iframe loaded:", document.title);
    // Only enhance iframes that look like EC2 content
    waitForTable();
  }
}

/**
 * Wait for the Cloudscape table to render inside the iframe,
 * then inject our enhancements.
 */
function waitForTable(): void {
  injectStyles();

  const tryEnhance = () => {
    // Look for table body rows
    const rows = document.querySelectorAll("table tbody tr");
    if (rows.length > 0) {
      enhanceInstanceRows(rows);
    }
  };

  // Try immediately and on delays (table renders async)
  tryEnhance();
  setTimeout(tryEnhance, 1000);
  setTimeout(tryEnhance, 2000);
  setTimeout(tryEnhance, 4000);

  // Watch for DOM changes (table re-renders on filter, sort, pagination)
  const observer = new MutationObserver(() => {
    tryEnhance();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Add a stop button to each running instance row in the EC2 table.
 */
function enhanceInstanceRows(rows: NodeListOf<Element>): void {
  rows.forEach((row) => {
    // Skip if already enhanced
    if (row.querySelector(".acb-stop-btn")) return;

    const cells = row.querySelectorAll("td");
    if (cells.length < 3) return;

    // Find the cell that contains the instance state
    // Look for text content that indicates "Running" or "Stopped"
    let stateCell: HTMLElement | null = null;
    let isRunning = false;
    let isStopped = false;
    let instanceId = "";

    cells.forEach((cell) => {
      const text = cell.textContent?.trim().toLowerCase() || "";

      // Detect instance state
      if (text === "running" || text.includes("running")) {
        stateCell = cell;
        isRunning = true;
      } else if (text === "stopped" || text.includes("stopped")) {
        stateCell = cell;
        isStopped = true;
      }

      // Detect instance ID (i-xxxxxxxxx)
      const idMatch = cell.textContent?.match(/i-[0-9a-f]{8,17}/);
      if (idMatch) {
        instanceId = idMatch[0];
      }
    });

    // Only add buttons if we found a state and instance ID
    const targetCell = stateCell as HTMLElement | null;
    if (!targetCell || !instanceId) return;

    if (isRunning) {
      const stopBtn = createActionButton("⏹", "Stop instance", "acb-stop-btn", () => {
        handleStopInstance(instanceId, stopBtn);
      });
      targetCell.appendChild(stopBtn);
    } else if (isStopped) {
      const startBtn = createActionButton("▶️", "Start instance", "acb-start-btn", () => {
        handleStartInstance(instanceId, startBtn);
      });
      targetCell.appendChild(startBtn);
    }
  });
}

/**
 * Create an inline action button that matches AWS Console styling.
 */
function createActionButton(
  icon: string,
  title: string,
  className: string,
  onClick: () => void,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = `acb-inline-btn ${className}`;
  btn.textContent = icon;
  btn.title = title;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    onClick();
  });
  return btn;
}

/**
 * Stop an EC2 instance via the backend API.
 */
async function handleStopInstance(instanceId: string, btn: HTMLButtonElement): Promise<void> {
  btn.textContent = "⏳";
  btn.disabled = true;

  try {
    // Get auth token and account from chrome storage
    const { accessToken, activeAccountId } = await getStoredAuth();
    if (!accessToken || !activeAccountId) {
      showToast("Sign in and add an AWS account first", "error");
      btn.textContent = "⏹";
      btn.disabled = false;
      return;
    }

    const region = getRegionFromUrl();
    const API_BASE = await getApiBaseUrl();

    const res = await fetch(`${API_BASE}/aws/${activeAccountId}/ec2/instances/${instanceId}/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ region }),
    });

    if (res.ok) {
      showToast(`Stopping ${instanceId}`, "success");
      btn.textContent = "⏹";
      btn.disabled = false;
    } else {
      const data = await res.json();
      showToast(data.message || "Failed to stop instance", "error");
      btn.textContent = "⏹";
      btn.disabled = false;
    }
  } catch {
    showToast("Network error", "error");
    btn.textContent = "⏹";
    btn.disabled = false;
  }
}

/**
 * Start an EC2 instance via the backend API.
 */
async function handleStartInstance(instanceId: string, btn: HTMLButtonElement): Promise<void> {
  btn.textContent = "⏳";
  btn.disabled = true;

  try {
    const { accessToken, activeAccountId } = await getStoredAuth();
    if (!accessToken || !activeAccountId) {
      showToast("Sign in and add an AWS account first", "error");
      btn.textContent = "▶️";
      btn.disabled = false;
      return;
    }

    const region = getRegionFromUrl();
    const API_BASE = await getApiBaseUrl();

    const res = await fetch(
      `${API_BASE}/aws/${activeAccountId}/ec2/instances/${instanceId}/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ region }),
      },
    );

    if (res.ok) {
      showToast(`Starting ${instanceId}`, "success");
      btn.textContent = "▶️";
      btn.disabled = false;
    } else {
      const data = await res.json();
      showToast(data.message || "Failed to start instance", "error");
      btn.textContent = "▶️";
      btn.disabled = false;
    }
  } catch {
    showToast("Network error", "error");
    btn.textContent = "▶️";
    btn.disabled = false;
  }
}

// ============================================================
// UTILITIES
// ============================================================

function getRegionFromUrl(): string {
  // Try parent frame URL first (iframe may not have region in its URL)
  try {
    const parentUrl = window.top?.location.href || window.location.href;
    const url = new URL(parentUrl);
    const param = url.searchParams.get("region");
    if (param) return param;
    const match = url.hostname.match(/^([a-z]{2}-[a-z]+-\d)/);
    if (match) return match[1];
  } catch {
    // Cross-origin — can't access parent
  }
  return "us-east-1";
}

async function getStoredAuth(): Promise<{
  accessToken: string | null;
  activeAccountId: string | null;
}> {
  return new Promise((resolve) => {
    chrome.storage.local.get(["accessToken", "activeAccountId"], (result) => {
      resolve({
        accessToken: (result.accessToken as string) || null,
        activeAccountId: (result.activeAccountId as string) || null,
      });
    });
  });
}

async function getApiBaseUrl(): Promise<string> {
  // Hardcoded for now — could be made configurable
  return "https://7ix3bp5dr3.execute-api.eu-west-2.amazonaws.com/dev/v1";
}

function showToast(message: string, type: "success" | "error" | "info"): void {
  // Remove existing toasts
  document.querySelectorAll(".acb-toast").forEach((el) => el.remove());

  const toast = document.createElement("div");
  toast.className = `acb-toast acb-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "acb-fade-out 0.2s ease-out forwards";
    setTimeout(() => toast.remove(), 200);
  }, 3000);
}

function injectStyles(): void {
  if (document.getElementById("acb-styles")) return;
  const style = document.createElement("style");
  style.id = "acb-styles";
  style.textContent = `
    .acb-inline-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      margin-left: 6px;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 4px;
      background: transparent;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      vertical-align: middle;
      transition: all 0.15s ease;
    }
    .acb-inline-btn:hover {
      background: rgba(0, 0, 0, 0.08);
      border-color: rgba(0, 0, 0, 0.15);
    }
    .acb-inline-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .acb-stop-btn:hover { background: rgba(209, 50, 18, 0.1); }
    .acb-start-btn:hover { background: rgba(29, 129, 2, 0.1); }

    .acb-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      padding: 10px 16px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      font-family: "Amazon Ember", -apple-system, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: acb-slide-in 0.2s ease-out;
    }
    .acb-toast-success { background: #1d8102; color: #fff; }
    .acb-toast-error { background: #d13212; color: #fff; }
    .acb-toast-info { background: #0073bb; color: #fff; }
    @keyframes acb-slide-in { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
    @keyframes acb-fade-out { from { opacity:1; } to { opacity:0; } }
  `;
  document.head.appendChild(style);
}
