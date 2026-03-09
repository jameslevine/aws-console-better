/// <reference types="chrome" />

import {
  MessageType,
  type ExtensionMessage,
  type ExtensionResponse,
} from "@/shared/types/messages";

/**
 * Background Service Worker
 *
 * Central communication hub for the extension.
 * Handles:
 * - Message routing between content scripts, popup, and side panel
 * - Auth token management
 * - API calls to the backend
 */

// Open side panel when extension icon is clicked (if popup is not shown)
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch(console.error);

// Listen for messages from content scripts, popup, and side panel
chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender,
    sendResponse: (response: ExtensionResponse) => void,
  ) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((error) => {
        console.error("Error handling message:", error);
        sendResponse({ success: false, error: error.message });
      });

    // Return true to indicate async response
    return true;
  },
);

// Handle tab updates to detect AWS Console navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url?.includes("console.aws.amazon.com")
  ) {
    // Enable side panel for AWS Console tabs
    chrome.sidePanel.setOptions({
      tabId,
      path: "src/sidepanel/index.html",
      enabled: true,
    });
  }
});

/**
 * Route messages to appropriate handlers
 */
async function handleMessage(
  message: ExtensionMessage,
): Promise<ExtensionResponse> {
  switch (message.type) {
    case MessageType.GET_AUTH_TOKEN:
      return handleGetAuthToken();

    case MessageType.SET_AUTH_TOKEN:
      return handleSetAuthToken(message.payload);

    case MessageType.CLEAR_AUTH_TOKEN:
      return handleClearAuthToken();

    case MessageType.GET_ACTIVE_ACCOUNT:
      return handleGetActiveAccount();

    case MessageType.SET_ACTIVE_ACCOUNT:
      return handleSetActiveAccount(message.payload);

    case MessageType.API_REQUEST:
      return handleApiRequest(message.payload);

    case MessageType.GET_PAGE_CONTEXT:
      return handleGetPageContext();

    default:
      return { success: false, error: "Unknown message type" };
  }
}

/**
 * Auth token management using chrome.storage.local
 */
async function handleGetAuthToken(): Promise<ExtensionResponse> {
  const result = await chrome.storage.local.get([
    "accessToken",
    "refreshToken",
    "expiresAt",
  ]);
  if (result.accessToken) {
    return {
      success: true,
      data: {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt,
      },
    };
  }
  return { success: false, error: "No auth token found" };
}

async function handleSetAuthToken(payload: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}): Promise<ExtensionResponse> {
  const expiresAt = Date.now() + payload.expiresIn * 1000;
  await chrome.storage.local.set({
    accessToken: payload.accessToken,
    refreshToken: payload.refreshToken,
    expiresAt,
  });
  return { success: true };
}

async function handleClearAuthToken(): Promise<ExtensionResponse> {
  await chrome.storage.local.remove([
    "accessToken",
    "refreshToken",
    "expiresAt",
  ]);
  return { success: true };
}

/**
 * Active AWS account management
 */
async function handleGetActiveAccount(): Promise<ExtensionResponse> {
  const result = await chrome.storage.local.get(["activeAccountId"]);
  return { success: true, data: { accountId: result.activeAccountId || null } };
}

async function handleSetActiveAccount(payload: {
  accountId: string;
}): Promise<ExtensionResponse> {
  await chrome.storage.local.set({ activeAccountId: payload.accountId });
  return { success: true };
}

/**
 * API request handler — proxies requests to the backend
 */
async function handleApiRequest(payload: {
  method: string;
  path: string;
  body?: unknown;
  query?: Record<string, string>;
}): Promise<ExtensionResponse> {
  try {
    const { accessToken } = await chrome.storage.local.get(["accessToken"]);

    if (!accessToken) {
      return { success: false, error: "Not authenticated" };
    }

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1";
    let url = `${baseUrl}${payload.path}`;

    if (payload.query) {
      const params = new URLSearchParams(payload.query);
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: payload.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: payload.body ? JSON.stringify(payload.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      return { success: false, error: data.message || "API request failed" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("API request error:", error);
    return { success: false, error: "Network error" };
  }
}

/**
 * Get current page context from the active tab
 */
async function handleGetPageContext(): Promise<ExtensionResponse> {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.url) {
      return { success: false, error: "No active tab" };
    }

    return {
      success: true,
      data: {
        url: tab.url,
        title: tab.title,
      },
    };
  } catch (error) {
    console.error("Error getting page context:", error);
    return { success: false, error: "Failed to get page context" };
  }
}

console.log("AWS Console Better — Background service worker loaded");
