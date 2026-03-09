import type { AwsPageContext } from "@/shared/types/aws";
import { detectPageContext } from "./detectors/serviceDetector";

/**
 * Content Script — Injected into AWS Console pages
 *
 * Responsibilities:
 * - Detect current AWS service/resource context
 * - Inject floating toolbar with quick actions
 * - Handle client-side operations (copy to clipboard)
 * - Communicate with background service worker for server-side operations
 */

let currentContext: AwsPageContext | null = null;

/**
 * Copy text to clipboard and show a toast notification
 */
function copyToClipboard(text: string, label: string): void {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      showToast(`Copied ${label}`, "success");
    })
    .catch(() => {
      showToast(`Failed to copy ${label}`, "error");
    });
}

/**
 * Show a toast notification on the page
 */
function showToast(message: string, type: "success" | "error" | "info" = "info"): void {
  // Remove existing toasts
  document.querySelectorAll(".acb-toast").forEach((el) => el.remove());

  const toast = document.createElement("div");
  toast.className = `acb-toast acb-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Auto-remove after 2 seconds
  setTimeout(() => {
    toast.style.animation = "acb-fade-out 0.2s ease-out forwards";
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}

/**
 * Create the floating toolbar with context-aware actions
 */
function createToolbar(context: AwsPageContext): HTMLElement {
  const toolbar = document.createElement("div");
  toolbar.className = "acb-toolbar";
  toolbar.id = "acb-toolbar";

  // Always show: Open Side Panel button
  const sidePanelBtn = createToolbarButton("⚡ AWS Better", "acb-btn-primary", () => {
    chrome.runtime.sendMessage({ type: "OPEN_SIDE_PANEL" });
  });
  toolbar.appendChild(sidePanelBtn);

  // Show copy buttons based on context
  if (context.region) {
    const regionBtn = createToolbarButton(`📋 Region: ${context.region}`, "acb-btn-ghost", () => {
      copyToClipboard(context.region!, "region");
    });
    toolbar.appendChild(regionBtn);
  }

  if (context.resourceId) {
    const resourceBtn = createToolbarButton(
      `📋 ${context.resourceType}: ${truncate(context.resourceId, 20)}`,
      "acb-btn-ghost",
      () => {
        copyToClipboard(context.resourceId!, context.resourceType || "resource ID");
      },
    );
    toolbar.appendChild(resourceBtn);
  }

  if (context.service && context.resourceId) {
    // Show "Copy to Region" button for specific resources
    const copyRegionBtn = createToolbarButton("🌍 Copy to Region", "acb-btn-secondary", () => {
      chrome.runtime.sendMessage({
        type: "OPEN_SIDE_PANEL",
        payload: {
          action: "copy-to-region",
          context,
        },
      });
    });
    toolbar.appendChild(copyRegionBtn);

    // Show "Show CLI" button
    const cliBtn = createToolbarButton("💻 Show CLI", "acb-btn-ghost", () => {
      const cliCommand = generateCliCommand(context);
      if (cliCommand) {
        copyToClipboard(cliCommand, "CLI command");
      }
    });
    toolbar.appendChild(cliBtn);
  }

  return toolbar;
}

/**
 * Create a toolbar button element
 */
function createToolbarButton(
  label: string,
  className: string,
  onClick: () => void,
): HTMLButtonElement {
  const btn = document.createElement("button");
  btn.className = `acb-btn ${className}`;
  btn.textContent = label;
  btn.addEventListener("click", onClick);
  return btn;
}

/**
 * Generate the equivalent AWS CLI command for the current context
 */
function generateCliCommand(context: AwsPageContext): string | null {
  if (!context.service || !context.resourceId) return null;

  const regionFlag = context.region ? ` --region ${context.region}` : "";

  switch (context.service) {
    case "ec2":
      if (context.resourceType === "instance") {
        return `aws ec2 describe-instances --instance-ids ${context.resourceId}${regionFlag}`;
      }
      if (context.resourceType === "security-group") {
        return `aws ec2 describe-security-groups --group-ids ${context.resourceId}${regionFlag}`;
      }
      break;
    case "s3":
      if (context.resourceType === "bucket") {
        return `aws s3api get-bucket-location --bucket ${context.resourceId}`;
      }
      break;
    case "lambda":
      if (context.resourceType === "function") {
        return `aws lambda get-function --function-name ${context.resourceId}${regionFlag}`;
      }
      break;
    case "dynamodb":
      if (context.resourceType === "table") {
        return `aws dynamodb describe-table --table-name ${context.resourceId}${regionFlag}`;
      }
      break;
    case "iam":
      if (context.resourceType === "role") {
        return `aws iam get-role --role-name ${context.resourceId}`;
      }
      if (context.resourceType === "policy") {
        return `aws iam get-policy --policy-arn ${context.resourceId}`;
      }
      break;
    case "cloudformation":
      if (context.resourceType === "stack") {
        return `aws cloudformation describe-stacks --stack-name ${context.resourceId}${regionFlag}`;
      }
      break;
  }

  return null;
}

/**
 * Truncate a string to a max length
 */
function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.substring(0, maxLength) + "..." : str;
}

/**
 * Update the toolbar when the page context changes
 */
function updateToolbar(): void {
  const newContext = detectPageContext();

  // Only update if context has changed
  if (JSON.stringify(newContext) === JSON.stringify(currentContext)) {
    return;
  }

  currentContext = newContext;

  // Remove existing toolbar
  const existingToolbar = document.getElementById("acb-toolbar");
  if (existingToolbar) {
    existingToolbar.remove();
  }

  // Only show toolbar on AWS Console pages with detected service
  if (currentContext.service) {
    const toolbar = createToolbar(currentContext);
    document.body.appendChild(toolbar);
  }
}

/**
 * Initialize the content script
 */
function injectStyles(): void {
  const style = document.createElement("style");
  style.id = "acb-styles";
  style.textContent = `
    .acb-toolbar { position:fixed; bottom:20px; right:20px; z-index:99999; display:flex; flex-direction:column; gap:8px; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    .acb-btn { display:flex; align-items:center; gap:6px; padding:8px 12px; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; transition:all .15s ease; box-shadow:0 2px 8px rgba(0,0,0,.15),0 0 1px rgba(0,0,0,.1); white-space:nowrap; }
    .acb-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.2),0 0 1px rgba(0,0,0,.1); }
    .acb-btn:active { transform:translateY(0); }
    .acb-btn-primary { background:#ff9900; color:#232f3e; }
    .acb-btn-primary:hover { background:#ec7211; }
    .acb-btn-secondary { background:#232f3e; color:#fff; }
    .acb-btn-secondary:hover { background:#37475a; }
    .acb-btn-ghost { background:rgba(255,255,255,.95); color:#232f3e; border:1px solid #d5dbdb; }
    .acb-btn-ghost:hover { background:#fff; border-color:#879596; }
    .acb-toast { position:fixed; top:20px; right:20px; z-index:999999; padding:10px 16px; border-radius:8px; font-size:13px; font-weight:500; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; box-shadow:0 4px 12px rgba(0,0,0,.15); animation:acb-slide-in .2s ease-out; }
    .acb-toast-success { background:#1d8102; color:#fff; }
    .acb-toast-error { background:#d13212; color:#fff; }
    .acb-toast-info { background:#0073bb; color:#fff; }
    @keyframes acb-slide-in { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
    @keyframes acb-fade-out { from { opacity:1; } to { opacity:0; } }
  `;
  document.head.appendChild(style);
}

function init(): void {
  console.log("AWS Console Better — Content script loaded");

  // Inject styles
  injectStyles();

  // Initial context detection
  updateToolbar();

  // Watch for URL changes (AWS Console uses client-side routing)
  let lastUrl = window.location.href;
  const urlObserver = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      updateToolbar();
    }
  });

  urlObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also listen for popstate events (back/forward navigation)
  window.addEventListener("popstate", () => {
    setTimeout(updateToolbar, 100);
  });

  // Listen for hashchange events
  window.addEventListener("hashchange", () => {
    setTimeout(updateToolbar, 100);
  });
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
