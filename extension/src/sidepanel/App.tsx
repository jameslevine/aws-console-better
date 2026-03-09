import { useEffect, useState } from "react";

import { MessageType } from "@/shared/types/messages";

type Tab = "context" | "actions" | "history" | "settings";

/**
 * Side Panel App — Main UI for AWS Console Better
 *
 * Provides:
 * - Current page context display
 * - Cross-region resource views
 * - Copy to region workflows
 * - Action history
 * - Settings and account management
 */
export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("context");
  const [pageContext, setPageContext] = useState<{
    url: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    // Get current page context
    chrome.runtime.sendMessage({ type: MessageType.GET_PAGE_CONTEXT }, (response) => {
      if (response?.success) {
        setPageContext(response.data);
      }
    });

    // Listen for tab updates
    const handleTabUpdate = () => {
      chrome.runtime.sendMessage({ type: MessageType.GET_PAGE_CONTEXT }, (response) => {
        if (response?.success) {
          setPageContext(response.data);
        }
      });
    };

    chrome.tabs.onUpdated.addListener(handleTabUpdate);
    return () => chrome.tabs.onUpdated.removeListener(handleTabUpdate);
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "context", label: "Context", icon: "🔍" },
    { id: "actions", label: "Actions", icon: "⚡" },
    { id: "history", label: "History", icon: "📜" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 bg-[#232f3e] px-4 py-3">
        <span className="text-lg">⚡</span>
        <h1 className="text-sm font-semibold text-white">AWS Console Better</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-1 items-center justify-center gap-1 px-2 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-[#ff9900] text-[#ff9900]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "context" && <ContextTab pageContext={pageContext} />}
        {activeTab === "actions" && <ActionsTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

/**
 * Context Tab — Shows current AWS page context
 */
function ContextTab({ pageContext }: { pageContext: { url: string; title: string } | null }) {
  const isAwsConsole = pageContext?.url?.includes("console.aws.amazon.com");

  if (!pageContext || !isAwsConsole) {
    return (
      <div className="flex flex-col items-center gap-3 pt-12 text-center">
        <span className="text-4xl">🌐</span>
        <h2 className="text-base font-semibold text-gray-900">Navigate to AWS Console</h2>
        <p className="text-sm text-gray-500">
          Open the AWS Management Console to see context-aware features and quick actions.
        </p>
        <a
          href="https://console.aws.amazon.com"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 rounded-lg bg-[#ff9900] px-4 py-2 text-sm font-semibold text-[#232f3e] transition-colors hover:bg-[#ec7211]"
        >
          Open AWS Console
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Current Page</h2>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-900">{pageContext.title || "AWS Console"}</p>
          <p className="mt-1 truncate text-xs text-gray-500">{pageContext.url}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Quick Actions</h2>
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50">
            <span>🌍</span>
            <span>View Across Regions</span>
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50">
            <span>📋</span>
            <span>Copy Resource Config</span>
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-left text-sm transition-colors hover:bg-gray-50">
            <span>💻</span>
            <span>Show CLI Command</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Actions Tab — AWS operations
 */
function ActionsTab() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-900">AWS Actions</h2>

      <div className="flex flex-col gap-2">
        <ActionCard
          icon="🌍"
          title="Copy to Region"
          description="Replicate a resource's configuration to another AWS region"
        />
        <ActionCard
          icon="🔄"
          title="Environment Manager"
          description="Clone and manage environments using tags"
        />
        <ActionCard
          icon="🔍"
          title="Global Search"
          description="Search resources across all regions"
        />
        <ActionCard
          icon="📊"
          title="Resource Diff"
          description="Compare resource configs across regions"
        />
      </div>
    </div>
  );
}

function ActionCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <button className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </button>
  );
}

/**
 * History Tab — Action history
 */
function HistoryTab() {
  return (
    <div className="flex flex-col items-center gap-3 pt-12 text-center">
      <span className="text-4xl">📜</span>
      <h2 className="text-base font-semibold text-gray-900">No History Yet</h2>
      <p className="text-sm text-gray-500">
        Actions you perform through AWS Console Better will appear here.
      </p>
    </div>
  );
}

/**
 * Settings Tab — Account and preferences
 */
function SettingsTab() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">AWS Accounts</h2>
        <button className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition-colors hover:border-[#ff9900] hover:text-[#ff9900]">
          + Add AWS Account
        </button>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Preferences</h2>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-sm text-gray-700">Show Toolbar</span>
            <input type="checkbox" defaultChecked className="accent-[#ff9900]" />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
            <span className="text-sm text-gray-700">Keyboard Shortcuts</span>
            <input type="checkbox" defaultChecked className="accent-[#ff9900]" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-2 text-sm font-semibold text-gray-900">Account</h2>
        <button className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50">
          Sign Out
        </button>
      </div>

      <p className="text-center text-xs text-gray-400">AWS Console Better v0.1.0</p>
    </div>
  );
}
