import { useEffect, useState } from "react";

import { MessageType } from "@/shared/types/messages";
import { api } from "@/shared/api/client";

type Tab = "context" | "actions" | "history" | "settings";

interface AwsAccount {
  accountId: string;
  accountName: string;
  awsAccountId: string;
  defaultRegion: string;
  isDefault: boolean;
}

interface Ec2Instance {
  instanceId: string;
  instanceType: string;
  state: string;
  name: string | null;
  region: string;
  publicIp: string | null;
  privateIp: string | null;
}

export function App() {
  const [activeTab, setActiveTab] = useState<Tab>("context");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<AwsAccount[]>([]);
  const [activeAccount, setActiveAccount] = useState<string | null>(null);

  const loadAccounts = async () => {
    const result = await api.get<{ accounts: AwsAccount[] }>("/accounts");
    if (result.data) {
      setAccounts(result.data.accounts);
      const defaultAcc = result.data.accounts.find((a) => a.isDefault);
      if (defaultAcc) setActiveAccount(defaultAcc.accountId);
      else if (result.data.accounts.length > 0) setActiveAccount(result.data.accounts[0].accountId);
    }
  };

  useEffect(() => {
    chrome.runtime.sendMessage({ type: MessageType.GET_AUTH_TOKEN }, (response) => {
      setIsAuthenticated(response?.success ?? false);
      setLoading(false);
      if (response?.success) {
        loadAccounts();
      }
    });
  }, []);

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "context", label: "Resources", icon: "🔍" },
    { id: "actions", label: "Actions", icon: "⚡" },
    { id: "history", label: "History", icon: "📜" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="text-4xl">🔒</span>
        <h2 className="text-base font-semibold text-gray-900">Sign In Required</h2>
        <p className="text-sm text-gray-500">
          Click the extension icon in the toolbar to sign in first.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Header with account selector */}
      <div className="border-b border-gray-200 bg-[#232f3e] px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚡</span>
            <span className="text-xs font-semibold text-white">AWS Better</span>
          </div>
          {accounts.length > 0 && (
            <select
              value={activeAccount || ""}
              onChange={(e) => setActiveAccount(e.target.value)}
              className="rounded bg-[#37475a] px-2 py-1 text-xs text-white"
            >
              {accounts.map((acc) => (
                <option key={acc.accountId} value={acc.accountId}>
                  {acc.accountName} ({acc.awsAccountId})
                </option>
              ))}
            </select>
          )}
        </div>
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
        {activeTab === "context" && <ResourcesTab accountId={activeAccount} />}
        {activeTab === "actions" && <ActionsTab />}
        {activeTab === "history" && <HistoryTab />}
        {activeTab === "settings" && (
          <SettingsTab accounts={accounts} onAccountAdded={loadAccounts} />
        )}
      </div>
    </div>
  );
}

/**
 * Resources Tab — Shows real AWS resources from the user's account
 */
function ResourcesTab({ accountId }: { accountId: string | null }) {
  const [instances, setInstances] = useState<Ec2Instance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadInstances = async () => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    const result = await api.get<{ instances: Ec2Instance[] }>(`/aws/${accountId}/ec2/instances`, {
      allRegions: "true",
    });
    if (result.data) {
      setInstances(result.data.instances);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  if (!accountId) {
    return (
      <div className="flex flex-col items-center gap-3 pt-12 text-center">
        <span className="text-4xl">🔗</span>
        <h2 className="text-base font-semibold text-gray-900">No AWS Account</h2>
        <p className="text-sm text-gray-500">
          Go to Settings tab to add your AWS account credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">EC2 Instances</h2>
        <button
          onClick={loadInstances}
          disabled={loading}
          className="rounded bg-[#ff9900] px-3 py-1 text-xs font-medium text-[#232f3e] hover:bg-[#ec7211] disabled:opacity-50"
        >
          {loading ? "Loading..." : "Load Instances"}
        </button>
      </div>

      {error && <div className="rounded bg-red-50 p-2 text-xs text-red-600">{error}</div>}

      {instances.length === 0 && !loading && !error && (
        <p className="text-xs text-gray-500">
          Click "Load Instances" to fetch EC2 instances across all regions.
        </p>
      )}

      {instances.map((instance) => (
        <div
          key={`${instance.region}-${instance.instanceId}`}
          className="rounded-lg border border-gray-200 p-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">
              {instance.name || instance.instanceId}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                instance.state === "running"
                  ? "bg-green-100 text-green-700"
                  : instance.state === "stopped"
                    ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {instance.state}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-500">
            <span
              className="cursor-pointer hover:text-[#0073bb]"
              onClick={() => {
                navigator.clipboard.writeText(instance.instanceId);
              }}
            >
              📋 {instance.instanceId}
            </span>
            <span>| {instance.instanceType}</span>
            <span>| 🌍 {instance.region}</span>
          </div>
          {(instance.publicIp || instance.privateIp) && (
            <div className="mt-1 flex gap-2 text-xs text-gray-500">
              {instance.publicIp && (
                <span
                  className="cursor-pointer hover:text-[#0073bb]"
                  onClick={() => navigator.clipboard.writeText(instance.publicIp!)}
                >
                  📋 Public: {instance.publicIp}
                </span>
              )}
              {instance.privateIp && (
                <span
                  className="cursor-pointer hover:text-[#0073bb]"
                  onClick={() => navigator.clipboard.writeText(instance.privateIp!)}
                >
                  📋 Private: {instance.privateIp}
                </span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Actions Tab
 */
function ActionsTab() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-gray-900">AWS Actions</h2>
      <div className="flex flex-col gap-2">
        <ActionCard
          icon="🌍"
          title="Copy to Region"
          description="Replicate a resource to another AWS region"
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
 * History Tab
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
 * Settings Tab — Add/manage AWS accounts
 */
function SettingsTab({
  accounts,
  onAccountAdded,
}: {
  accounts: AwsAccount[];
  onAccountAdded: () => void;
}) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">AWS Accounts</h2>
          <span className="text-xs text-gray-400">{accounts.length} account(s)</span>
        </div>

        {accounts.map((acc) => (
          <div key={acc.accountId} className="mb-2 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">{acc.accountName}</span>
              {acc.isDefault && (
                <span className="rounded bg-[#ff9900] px-1.5 py-0.5 text-xs text-[#232f3e]">
                  Default
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Account: {acc.awsAccountId} | Region: {acc.defaultRegion}
            </p>
          </div>
        ))}

        {showAddForm ? (
          <AddAccountForm
            onSuccess={() => {
              setShowAddForm(false);
              onAccountAdded();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 transition-colors hover:border-[#ff9900] hover:text-[#ff9900]"
          >
            + Add AWS Account
          </button>
        )}
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

      <p className="text-center text-xs text-gray-400">AWS Console Better v0.1.0</p>
    </div>
  );
}

/**
 * Add AWS Account Form
 */
function AddAccountForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [accountName, setAccountName] = useState("");
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [defaultRegion, setDefaultRegion] = useState("eu-west-2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    const result = await api.post("/accounts", {
      accountName,
      accessKeyId,
      secretAccessKey,
      defaultRegion,
      isDefault: true,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    onSuccess();
  };

  const regions = [
    "us-east-1",
    "us-east-2",
    "us-west-1",
    "us-west-2",
    "eu-west-1",
    "eu-west-2",
    "eu-west-3",
    "eu-central-1",
    "eu-north-1",
    "ap-southeast-1",
    "ap-southeast-2",
    "ap-northeast-1",
    "ap-northeast-2",
    "ap-south-1",
    "sa-east-1",
    "ca-central-1",
  ];

  return (
    <div className="rounded-lg border border-[#ff9900] bg-orange-50 p-3">
      <h3 className="mb-2 text-sm font-semibold text-gray-900">Add AWS Account</h3>

      {error && <div className="mb-2 rounded bg-red-50 p-2 text-xs text-red-600">{error}</div>}

      <div className="flex flex-col gap-2">
        <input
          type="text"
          placeholder="Account name (e.g., Production)"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-[#ff9900] focus:outline-none"
        />
        <input
          type="text"
          placeholder="Access Key ID (AKIA...)"
          value={accessKeyId}
          onChange={(e) => setAccessKeyId(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-xs font-mono focus:border-[#ff9900] focus:outline-none"
        />
        <input
          type="password"
          placeholder="Secret Access Key"
          value={secretAccessKey}
          onChange={(e) => setSecretAccessKey(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-xs font-mono focus:border-[#ff9900] focus:outline-none"
        />
        <select
          value={defaultRegion}
          onChange={(e) => setDefaultRegion(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1.5 text-xs focus:border-[#ff9900] focus:outline-none"
        >
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || !accountName || !accessKeyId || !secretAccessKey}
            className="flex-1 rounded bg-[#ff9900] px-3 py-1.5 text-xs font-semibold text-[#232f3e] hover:bg-[#ec7211] disabled:opacity-50"
          >
            {loading ? "Verifying & Adding..." : "Add Account"}
          </button>
          <button
            onClick={onCancel}
            className="rounded border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-400">
          Credentials are encrypted with KMS before storage. We verify them with STS before saving.
        </p>
      </div>
    </div>
  );
}
