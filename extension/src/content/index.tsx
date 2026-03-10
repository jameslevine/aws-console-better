/**
 * AWS Console Better — Content Script
 *
 * Runs in the main AWS Console frame.
 * Accesses EC2 iframe content via contentDocument (same-origin).
 */

import {
  colorBackgroundButtonNormalActive,
  colorBackgroundButtonNormalHover,
  colorTextButtonNormalDefault,
  colorTextButtonNormalHover,
  fontFamilyBase,
} from "@cloudscape-design/design-tokens";

const ACB_MARKER = "acb-injected";

if (document.documentElement.getAttribute(ACB_MARKER)) {
  // Already injected
} else {
  document.documentElement.setAttribute(ACB_MARKER, "true");

  // Only run in the top frame
  if (window === window.top) {
    init();
  }
}

function init(): void {
  console.log("AWS Console Better — Content script loaded");
  injectStyles();

  // Watch for the EC2 iframe to appear and enhance it
  const tryEnhance = () => {
    // Try to access the compute-react-frame iframe (EC2 instances)
    const iframe = document.getElementById("compute-react-frame") as HTMLIFrameElement | null;
    if (iframe) {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc && iframeDoc.body) {
          enhanceIframeContent(iframeDoc);
        }
      } catch (e) {
        // Cross-origin — can't access iframe content
        console.log("AWS Console Better — Cannot access iframe (cross-origin):", e);
      }
    }

    // Also try security-groups-react-frame
    const sgIframe = document.getElementById(
      "security-groups-react-frame",
    ) as HTMLIFrameElement | null;
    if (sgIframe) {
      try {
        const sgDoc = sgIframe.contentDocument || sgIframe.contentWindow?.document;
        if (sgDoc && sgDoc.body) {
          enhanceIframeContent(sgDoc);
        }
      } catch {
        // Cross-origin
      }
    }
  };

  // Try periodically (iframe content loads async)
  setInterval(tryEnhance, 2000);

  // Also watch for hash changes (page navigation)
  window.addEventListener("hashchange", () => {
    setTimeout(tryEnhance, 1000);
    setTimeout(tryEnhance, 3000);
  });
}

/**
 * Enhance the content inside an EC2 iframe document.
 */
function enhanceIframeContent(doc: Document): void {
  // Inject styles into the iframe if not already done
  if (!doc.getElementById("acb-styles")) {
    const style = doc.createElement("style");
    style.id = "acb-styles";
    style.textContent = getStyles();
    doc.head.appendChild(style);
  }

  // Find table rows
  const rows = doc.querySelectorAll("table tbody tr");
  if (rows.length === 0) return;

  rows.forEach((row) => {
    // Skip if already enhanced
    if (row.querySelector(".acb-stop-btn") || row.querySelector(".acb-start-btn")) return;

    const cells = row.querySelectorAll("td");
    if (cells.length < 3) return;

    let stateCell: HTMLElement | null = null;
    let isRunning = false;
    let isStopped = false;
    let instanceId = "";

    cells.forEach((cell) => {
      const text = cell.textContent?.trim().toLowerCase() || "";

      if (text === "running" || text.includes("running")) {
        stateCell = cell as HTMLElement;
        isRunning = true;
      } else if (text === "stopped" || text.includes("stopped")) {
        stateCell = cell as HTMLElement;
        isStopped = true;
      }

      const idMatch = cell.textContent?.match(/i-[0-9a-f]{8,17}/);
      if (idMatch) {
        instanceId = idMatch[0];
      }
    });

    const targetCell = stateCell as HTMLElement | null;
    if (!targetCell || !instanceId) return;

    if (isRunning) {
      const btn = createButton(doc, "⏹", "Stop instance", "acb-stop-btn");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleAction(instanceId, "stop", btn, doc);
      });
      targetCell.appendChild(btn);
    } else if (isStopped) {
      const btn = createButton(doc, "▶️", "Start instance", "acb-start-btn");
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        handleAction(instanceId, "start", btn, doc);
      });
      targetCell.appendChild(btn);
    }
  });
}

function createButton(
  doc: Document,
  icon: string,
  title: string,
  className: string,
): HTMLButtonElement {
  const btn = doc.createElement("button");
  btn.className = `acb-cs-btn ${className}`;
  btn.title = title;
  btn.type = "button";
  btn.innerHTML = `<span class="acb-cs-btn-icon">${icon === "⏹" ? "⏹" : "▶"}</span>`;
  return btn;
}

async function handleAction(
  instanceId: string,
  action: "stop" | "start",
  btn: HTMLButtonElement,
  doc: Document,
): Promise<void> {
  const originalIcon = btn.textContent;
  btn.textContent = "⏳";
  btn.disabled = true;

  try {
    const { accessToken, activeAccountId } = await getStoredAuth();
    if (!accessToken || !activeAccountId) {
      showToast(doc, "Sign in and add an AWS account first", "error");
      btn.textContent = originalIcon;
      btn.disabled = false;
      return;
    }

    const region = getRegionFromUrl();
    const API_BASE = "https://7ix3bp5dr3.execute-api.eu-west-2.amazonaws.com/dev/v1";

    const res = await fetch(
      `${API_BASE}/aws/${activeAccountId}/ec2/instances/${instanceId}/${action}`,
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
      showToast(doc, `${action === "stop" ? "Stopping" : "Starting"} ${instanceId}`, "success");
    } else {
      const data = await res.json();
      showToast(doc, data.message || `Failed to ${action} instance`, "error");
    }
  } catch {
    showToast(doc, "Network error", "error");
  }

  btn.textContent = originalIcon;
  btn.disabled = false;
}

function getRegionFromUrl(): string {
  const url = new URL(window.location.href);
  const param = url.searchParams.get("region");
  if (param) return param;
  const match = url.hostname.match(/^([a-z]{2}-[a-z]+-\d)/);
  return match ? match[1] : "us-east-1";
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

function showToast(doc: Document, message: string, type: "success" | "error" | "info"): void {
  // Show toast in the main document (not iframe)
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

function getStyles(): string {
  return `
    .acb-cs-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      padding: 0;
      margin-left: 4px;
      border: none;
      border-radius: 4px;
      background: transparent;
      color: ${colorTextButtonNormalDefault};
      cursor: pointer;
      font-family: ${fontFamilyBase};
      font-size: 12px;
      line-height: 1;
      vertical-align: middle;
      transition: background 85ms linear, color 85ms linear;
    }
    .acb-cs-btn:hover {
      background: ${colorBackgroundButtonNormalHover};
      color: ${colorTextButtonNormalHover};
    }
    .acb-cs-btn:active {
      background: ${colorBackgroundButtonNormalActive};
    }
    .acb-cs-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
    .acb-cs-btn-icon {
      font-size: 12px;
      line-height: 1;
    }
  `;
}

function injectStyles(): void {
  if (document.getElementById("acb-styles")) return;
  const style = document.createElement("style");
  style.id = "acb-styles";
  style.textContent = `
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
