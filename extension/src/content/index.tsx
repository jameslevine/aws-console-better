/**
 * AWS Console Better — Content Script
 *
 * Runs in both the main AWS Console frame AND inside EC2 iframes.
 * Injects features directly into the AWS Console UI.
 */

const IS_TOP_FRAME = window === window.top;
const ACB_MARKER = "acb-injected";

// Prevent double injection
if (document.documentElement.getAttribute(ACB_MARKER)) {
  // Already injected
} else {
  document.documentElement.setAttribute(ACB_MARKER, "true");
  init();
}

function init(): void {
  if (IS_TOP_FRAME) {
    console.log("AWS Console Better — Content script loaded (main frame)");
    // Main frame features will be added here as we build them
  } else {
    console.log("AWS Console Better — Content script loaded (iframe)");
    // Iframe features will be added here as we build them
  }
}
