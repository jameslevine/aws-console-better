import { useEffect, useState } from "react";

import { MessageType } from "@/shared/types/messages";

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
}

/**
 * Popup App — Quick access panel
 *
 * Shows:
 * - Login/Register when not authenticated
 * - Account switcher and quick actions when authenticated
 */
export function App() {
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    // Check if user is authenticated
    chrome.runtime.sendMessage(
      { type: MessageType.GET_AUTH_TOKEN },
      (response) => {
        setAuth({
          isAuthenticated: response?.success ?? false,
          loading: false,
        });
      },
    );
  }, []);

  if (auth.loading) {
    return (
      <div className="flex h-[400px] w-[350px] items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-[400px] w-[350px]">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-[#232f3e] px-4 py-3">
        <span className="text-lg">⚡</span>
        <h1 className="text-base font-semibold text-white">
          AWS Console Better
        </h1>
      </div>

      {/* Content */}
      <div className="p-4">
        {auth.isAuthenticated ? <AuthenticatedView /> : <UnauthenticatedView />}
      </div>
    </div>
  );
}

/**
 * View shown when user is not logged in
 */
function UnauthenticatedView() {
  return (
    <div className="flex flex-col items-center gap-4 pt-8">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Welcome</h2>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to access AWS Console Better features
        </p>
      </div>

      <button className="w-full rounded-lg bg-[#ff9900] px-4 py-2.5 text-sm font-semibold text-[#232f3e] transition-colors hover:bg-[#ec7211]">
        Sign In
      </button>

      <button className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
        Create Account
      </button>

      <p className="text-xs text-gray-400">
        Manage your AWS resources with superpowers
      </p>
    </div>
  );
}

/**
 * View shown when user is logged in
 */
function AuthenticatedView() {
  const openSidePanel = () => {
    // Open the side panel for the current tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Quick Actions */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Quick Actions
        </h3>
        <div className="flex flex-col gap-2">
          <button
            onClick={openSidePanel}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50"
          >
            <span>📋</span>
            <span>Open Side Panel</span>
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50">
            <span>🌍</span>
            <span>Cross-Region View</span>
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50">
            <span>📜</span>
            <span>Action History</span>
          </button>
        </div>
      </div>

      {/* AWS Account */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          AWS Account
        </h3>
        <div className="rounded-lg border border-gray-200 px-3 py-2">
          <p className="text-sm font-medium text-gray-900">No account linked</p>
          <p className="text-xs text-gray-500">
            Add an AWS account in settings
          </p>
        </div>
      </div>

      {/* Settings */}
      <button className="mt-2 text-center text-xs text-[#0073bb] hover:underline">
        Settings
      </button>
    </div>
  );
}
