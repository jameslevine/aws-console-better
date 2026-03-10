/**
 * AWS Console Better — Content Script
 *
 * Runs in both the main AWS Console frame AND inside EC2 iframes.
 * Detects context and injects appropriate UI enhancements.
 */

const IS_TOP_FRAME = window === window.top;
const IS_IFRAME = !IS_TOP_FRAME;
const ACB_MARKER = "acb-injected";

// Prevent double injection
if (document.documentElement.getAttribute(ACB_MARKER)) {
  // Already injected
} else {
  document.documentElement.setAttribute(ACB_MARKER, "true");
  init();
}

function init(): void {
  injectStyles();

  if (IS_TOP_FRAME) {
    initMainFrame();
  } else if (IS_IFRAME) {
    initIframe();
  }
}

// ============================================================
// MAIN FRAME — Toolbar below breadcrumbs + floating toolbar
// ============================================================

function initMainFrame(): void {
  console.log("AWS Console Better — Main frame loaded");

  const injectToolbar = () => {
    // Remove old toolbar if exists
    document.getElementById("acb-toolbar")?.remove();
    document.getElementById("acb-main-bar")?.remove();

    const url = window.location.href;
    if (!url.includes("console.aws.amazon.com")) return;

    // Detect service and region from URL
    const region = extractRegion();
    const service = extractService();
    const hash = window.location.hash;

    // Inject a slim bar below the toolbar section
    const toolbarSection = document.querySelector(
      '[class*="toolbar-container"][class*="universal-toolbar"]',
    );
    if (toolbarSection && !document.getElementById("acb-main-bar")) {
      const bar = document.createElement("div");
      bar.id = "acb-main-bar";
      bar.innerHTML = `
        <div class="acb-bar-content">
          <span class="acb-bar-badge">⚡ AWS Better</span>
          ${service ? `<span class="acb-bar-item">Service: <strong>${service.toUpperCase()}</strong></span>` : ""}
          ${region ? `<button class="acb-bar-btn" data-copy="${region}">📋 ${region}</button>` : ""}
          ${hash ? `<button class="acb-bar-btn" data-copy="${hash.replace("#", "")}">📋 Page: ${hash.replace("#", "").split(":")[0]}</button>` : ""}
          <button class="acb-bar-btn acb-bar-btn-primary" id="acb-cli-btn">💻 Show CLI</button>
        </div>
      `;
      toolbarSection.parentElement?.insertBefore(bar, toolbarSection.nextSibling);

      // Add click handlers for copy buttons
      bar.querySelectorAll("[data-copy]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const text = (btn as HTMLElement).getAttribute("data-copy") || "";
          copyToClipboard(text, "value");
        });
      });

      // CLI button
      const cliBtn = bar.querySelector("#acb-cli-btn");
      if (cliBtn) {
        cliBtn.addEventListener("click", () => {
          const cmd = generateCliCommand(service, region, hash);
          if (cmd) copyToClipboard(cmd, "CLI command");
        });
      }
    }

    // Also inject floating toolbar (bottom-right)
    if (service) {
      const toolbar = document.createElement("div");
      toolbar.className = "acb-toolbar";
      toolbar.id = "acb-toolbar";

      const btns = [
        { label: "⚡ AWS Better", cls: "acb-btn-primary", action: () => {} },
        ...(region
          ? [
              {
                label: `📋 ${region}`,
                cls: "acb-btn-ghost",
                action: () => copyToClipboard(region, "region"),
              },
            ]
          : []),
      ];

      btns.forEach(({ label, cls, action }) => {
        const btn = document.createElement("button");
        btn.className = `acb-btn ${cls}`;
        btn.textContent = label;
        btn.addEventListener("click", action);
        toolbar.appendChild(btn);
      });

      document.body.appendChild(toolbar);
    }
  };

  // Initial injection
  injectToolbar();

  // Watch for SPA navigation
  let lastUrl = window.location.href;
  const observer = new MutationObserver(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      injectToolbar();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("hashchange", () => setTimeout(injectToolbar, 200));
}

// ============================================================
// IFRAME — Inject into EC2 table content (instances, SGs, etc.)
// ============================================================

function initIframe(): void {
  console.log("AWS Console Better — Iframe loaded:", document.title);

  // Wait for Cloudscape table to render, then enhance it
  const enhanceTable = () => {
    // Look for Cloudscape table rows
    const tableRows = document.querySelectorAll('tr[class*="row"]');
    if (tableRows.length === 0) return;

    // Find cells that look like instance IDs, IPs, etc.
    const allCells = document.querySelectorAll("td");
    allCells.forEach((cell) => {
      const text = cell.textContent?.trim() || "";

      // Skip if already enhanced
      if (cell.querySelector(".acb-copy-icon")) return;

      // Instance IDs (i-xxxxx)
      if (/^i-[0-9a-f]{8,17}$/.test(text)) {
        addCopyIcon(cell, text, "Instance ID");
      }
      // Security Group IDs (sg-xxxxx)
      else if (/^sg-[0-9a-f]{8,17}$/.test(text)) {
        addCopyIcon(cell, text, "Security Group ID");
      }
      // Volume IDs (vol-xxxxx)
      else if (/^vol-[0-9a-f]{8,17}$/.test(text)) {
        addCopyIcon(cell, text, "Volume ID");
      }
      // Subnet IDs (subnet-xxxxx)
      else if (/^subnet-[0-9a-f]{8,17}$/.test(text)) {
        addCopyIcon(cell, text, "Subnet ID");
      }
      // VPC IDs (vpc-xxxxx)
      else if (/^vpc-[0-9a-f]{8,17}$/.test(text)) {
        addCopyIcon(cell, text, "VPC ID");
      }
      // IP addresses
      else if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(text)) {
        addCopyIcon(cell, text, "IP Address");
      }
      // AMI IDs (ami-xxxxx)
      else if (/^ami-[0-9a-f]{8,17}$/.test(text)) {
        addCopyIcon(cell, text, "AMI ID");
      }
    });

    // Look for detail panels (key-value pairs) and add copy icons
    const kvPairs = document.querySelectorAll('[class*="key-value"], [class*="detail"]');
    kvPairs.forEach((pair) => {
      const valueEl = pair.querySelector('[class*="value"]');
      if (!valueEl || valueEl.querySelector(".acb-copy-icon")) return;
      const text = valueEl.textContent?.trim() || "";
      if (
        text &&
        (text.startsWith("i-") || text.startsWith("sg-") || text.match(/^\d+\.\d+\.\d+\.\d+$/))
      ) {
        addCopyIcon(valueEl as HTMLElement, text, "value");
      }
    });

    // Add extra buttons to the header action bar if found
    const headerActions = document.querySelector(
      '[class*="header-actions"], [class*="actions-wrapper"]',
    );
    if (headerActions && !headerActions.querySelector(".acb-action-btn")) {
      const cliBtn = document.createElement("button");
      cliBtn.className = "acb-action-btn";
      cliBtn.textContent = "💻 Show CLI";
      cliBtn.title = "Copy AWS CLI command";
      cliBtn.addEventListener("click", () => {
        // Try to get the selected instance ID from the table
        const selected = document.querySelector(
          'tr[class*="selected"] td a, tr[aria-selected="true"] td a',
        );
        const instanceId = selected?.textContent?.trim();
        if (instanceId) {
          const cmd = `aws ec2 describe-instances --instance-ids ${instanceId}`;
          copyToClipboard(cmd, "CLI command");
        } else {
          copyToClipboard("aws ec2 describe-instances", "CLI command");
        }
      });
      headerActions.appendChild(cliBtn);
    }
  };

  // Run enhancement periodically (Cloudscape re-renders frequently)
  const runEnhancement = () => {
    enhanceTable();
  };

  // Initial run after a delay (wait for table to render)
  setTimeout(runEnhancement, 1000);
  setTimeout(runEnhancement, 3000);
  setTimeout(runEnhancement, 5000);

  // Watch for DOM changes and re-enhance
  const observer = new MutationObserver(() => {
    runEnhancement();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// ============================================================
// SHARED UTILITIES
// ============================================================

function addCopyIcon(element: Element, text: string, label: string): void {
  const icon = document.createElement("span");
  icon.className = "acb-copy-icon";
  icon.textContent = "📋";
  icon.title = `Copy ${label}: ${text}`;
  icon.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    copyToClipboard(text, label);
  });
  element.appendChild(icon);
}

function copyToClipboard(text: string, label: string): void {
  navigator.clipboard
    .writeText(text)
    .then(() => showToast(`Copied ${label}`, "success"))
    .catch(() => showToast(`Failed to copy ${label}`, "error"));
}

function showToast(message: string, type: "success" | "error" | "info" = "info"): void {
  document.querySelectorAll(".acb-toast").forEach((el) => el.remove());
  const toast = document.createElement("div");
  toast.className = `acb-toast acb-toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "acb-fade-out 0.2s ease-out forwards";
    setTimeout(() => toast.remove(), 200);
  }, 2000);
}

function extractRegion(): string | null {
  const url = new URL(window.location.href);
  const param = url.searchParams.get("region");
  if (param) return param;
  const match = url.hostname.match(/^([a-z]{2}-[a-z]+-\d)/);
  return match ? match[1] : null;
}

function extractService(): string | null {
  const url = window.location.href;
  if (url.includes("/ec2/")) return "ec2";
  if (url.includes("/s3/")) return "s3";
  if (url.includes("/lambda/")) return "lambda";
  if (url.includes("/dynamodb")) return "dynamodb";
  if (url.includes("/iam/")) return "iam";
  if (url.includes("/cloudformation/")) return "cloudformation";
  return null;
}

function generateCliCommand(
  service: string | null,
  region: string | null,
  hash: string,
): string | null {
  const regionFlag = region ? ` --region ${region}` : "";
  const page = hash.replace("#", "").split(":")[0];

  switch (service) {
    case "ec2":
      if (page === "Instances") return `aws ec2 describe-instances${regionFlag}`;
      if (page === "SecurityGroups") return `aws ec2 describe-security-groups${regionFlag}`;
      if (page === "Volumes") return `aws ec2 describe-volumes${regionFlag}`;
      if (page === "Images") return `aws ec2 describe-images --owners self${regionFlag}`;
      if (page === "KeyPairs") return `aws ec2 describe-key-pairs${regionFlag}`;
      if (page === "Addresses") return `aws ec2 describe-addresses${regionFlag}`;
      if (page === "LoadBalancers") return `aws elbv2 describe-load-balancers${regionFlag}`;
      if (page === "TargetGroups") return `aws elbv2 describe-target-groups${regionFlag}`;
      if (page === "AutoScalingGroups")
        return `aws autoscaling describe-auto-scaling-groups${regionFlag}`;
      if (page === "Snapshots") return `aws ec2 describe-snapshots --owner-ids self${regionFlag}`;
      return `aws ec2 describe-instances${regionFlag}`;
    case "s3":
      return "aws s3 ls";
    case "lambda":
      return `aws lambda list-functions${regionFlag}`;
    case "dynamodb":
      return `aws dynamodb list-tables${regionFlag}`;
    case "iam":
      return "aws iam list-roles";
    case "cloudformation":
      return `aws cloudformation list-stacks${regionFlag}`;
    default:
      return null;
  }
}

// ============================================================
// STYLES — Injected into both main frame and iframes
// ============================================================

function injectStyles(): void {
  if (document.getElementById("acb-styles")) return;
  const style = document.createElement("style");
  style.id = "acb-styles";
  style.textContent = `
    /* Floating toolbar (main frame) */
    .acb-toolbar { position:fixed; bottom:20px; right:20px; z-index:99999; display:flex; flex-direction:column; gap:8px; font-family:"Amazon Ember",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; }
    .acb-btn { display:flex; align-items:center; gap:6px; padding:8px 12px; border:none; border-radius:8px; font-size:13px; font-weight:500; cursor:pointer; transition:all .15s ease; box-shadow:0 2px 8px rgba(0,0,0,.15); white-space:nowrap; }
    .acb-btn:hover { transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.2); }
    .acb-btn-primary { background:#ff9900; color:#232f3e; }
    .acb-btn-primary:hover { background:#ec7211; }
    .acb-btn-ghost { background:rgba(255,255,255,.95); color:#232f3e; border:1px solid #d5dbdb; }
    .acb-btn-ghost:hover { background:#fff; border-color:#879596; }

    /* Main bar (below breadcrumbs) */
    .acb-main-bar, #acb-main-bar { background:#232f3e; border-bottom:2px solid #ff9900; padding:6px 16px; display:flex; align-items:center; font-family:"Amazon Ember",-apple-system,sans-serif; font-size:13px; z-index:999; position:relative; }
    .acb-bar-content { display:flex; align-items:center; gap:12px; width:100%; }
    .acb-bar-badge { background:#ff9900; color:#232f3e; padding:2px 8px; border-radius:4px; font-weight:700; font-size:11px; }
    .acb-bar-item { color:#d5dbdb; }
    .acb-bar-item strong { color:#fff; }
    .acb-bar-btn { background:transparent; border:1px solid #545b64; color:#d5dbdb; padding:3px 8px; border-radius:4px; cursor:pointer; font-size:12px; font-family:inherit; transition:all .15s; }
    .acb-bar-btn:hover { background:#37475a; color:#fff; border-color:#879596; }
    .acb-bar-btn-primary { background:#ff9900; color:#232f3e; border-color:#ff9900; font-weight:600; }
    .acb-bar-btn-primary:hover { background:#ec7211; }

    /* Copy icon (inside iframes) */
    .acb-copy-icon { cursor:pointer; margin-left:4px; font-size:12px; opacity:0.5; transition:opacity .15s; display:inline; vertical-align:middle; }
    .acb-copy-icon:hover { opacity:1; }

    /* Action button (inside iframes) */
    .acb-action-btn { background:#232f3e; color:#fff; border:1px solid #545b64; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px; font-family:"Amazon Ember",-apple-system,sans-serif; margin-left:8px; transition:all .15s; }
    .acb-action-btn:hover { background:#37475a; border-color:#879596; }

    /* Toast */
    .acb-toast { position:fixed; top:20px; right:20px; z-index:999999; padding:10px 16px; border-radius:8px; font-size:13px; font-weight:500; font-family:"Amazon Ember",-apple-system,sans-serif; box-shadow:0 4px 12px rgba(0,0,0,.15); animation:acb-slide-in .2s ease-out; }
    .acb-toast-success { background:#1d8102; color:#fff; }
    .acb-toast-error { background:#d13212; color:#fff; }
    .acb-toast-info { background:#0073bb; color:#fff; }
    @keyframes acb-slide-in { from { opacity:0; transform:translateX(20px); } to { opacity:1; transform:translateX(0); } }
    @keyframes acb-fade-out { from { opacity:1; } to { opacity:0; } }
  `;
  document.head.appendChild(style);
}
