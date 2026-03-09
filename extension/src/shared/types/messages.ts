/**
 * Message types for communication between extension components
 * (content scripts, popup, side panel, background service worker)
 */

export const MessageType = {
  // Auth
  GET_AUTH_TOKEN: "GET_AUTH_TOKEN",
  SET_AUTH_TOKEN: "SET_AUTH_TOKEN",
  CLEAR_AUTH_TOKEN: "CLEAR_AUTH_TOKEN",

  // AWS Account
  GET_ACTIVE_ACCOUNT: "GET_ACTIVE_ACCOUNT",
  SET_ACTIVE_ACCOUNT: "SET_ACTIVE_ACCOUNT",

  // API
  API_REQUEST: "API_REQUEST",

  // Page Context
  GET_PAGE_CONTEXT: "GET_PAGE_CONTEXT",

  // Content Script Actions
  COPY_TO_CLIPBOARD: "COPY_TO_CLIPBOARD",
  SHOW_NOTIFICATION: "SHOW_NOTIFICATION",
  OPEN_SIDE_PANEL: "OPEN_SIDE_PANEL",
} as const;

export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export interface ExtensionMessage {
  type: MessageType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export interface ExtensionResponse {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  error?: string;
}
