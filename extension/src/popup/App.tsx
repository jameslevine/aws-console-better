import { useEffect, useState } from "react";

import { MessageType } from "@/shared/types/messages";
import { api } from "@/shared/api/client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1";

type View = "loading" | "login" | "register" | "verify" | "authenticated";

interface AwsAccount {
  accountId: string;
  accountName: string;
  awsAccountId: string;
  defaultRegion: string;
}

export function App() {
  const [view, setView] = useState<View>("loading");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [accounts, setAccounts] = useState<AwsAccount[]>([]);

  const loadAccounts = async () => {
    const result = await api.get<{ accounts: AwsAccount[] }>("/accounts");
    if (result.data) setAccounts(result.data.accounts);
  };

  useEffect(() => {
    chrome.runtime.sendMessage({ type: MessageType.GET_AUTH_TOKEN }, (response) => {
      if (response?.success) {
        setView("authenticated");
        loadAccounts();
      } else {
        setView("login");
      }
    });
  }, []);

  if (view === "loading") {
    return (
      <div className="flex h-[300px] w-[320px] items-center justify-center">
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="w-[320px]">
      <div className="flex items-center gap-2 bg-[#232f3e] px-4 py-2.5">
        <span className="text-sm">⚡</span>
        <span className="text-sm font-semibold text-white">AWS Console Better</span>
      </div>
      <div className="p-4">
        {error && <div className="mb-3 rounded bg-red-50 p-2 text-xs text-red-600">{error}</div>}
        {view === "login" && (
          <LoginForm setView={setView} setError={setError} setEmail={setEmail} />
        )}
        {view === "register" && (
          <RegisterForm setView={setView} setError={setError} setEmail={setEmail} />
        )}
        {view === "verify" && <VerifyForm email={email} setView={setView} setError={setError} />}
        {view === "authenticated" && (
          <AuthView accounts={accounts} setView={setView} onAccountAdded={loadAccounts} />
        )}
      </div>
    </div>
  );
}

function LoginForm({
  setView,
  setError,
  setEmail: setParentEmail,
}: {
  setView: (v: View) => void;
  setError: (e: string) => void;
  setEmail: (e: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Login failed");
        setLoading(false);
        return;
      }
      chrome.runtime.sendMessage({
        type: MessageType.SET_AUTH_TOKEN,
        payload: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        },
      });
      setView("authenticated");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-center text-base font-semibold">Sign In</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        onClick={handleLogin}
        disabled={loading || !email || !password}
        className="rounded bg-[#ff9900] py-2 text-sm font-semibold text-[#232f3e] disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
      <button
        onClick={() => {
          setError("");
          setParentEmail("");
          setView("register");
        }}
        className="text-xs text-[#0073bb] hover:underline"
      >
        Create account
      </button>
    </div>
  );
}

function RegisterForm({
  setView,
  setError,
  setEmail: setParentEmail,
}: {
  setView: (v: View) => void;
  setError: (e: string) => void;
  setEmail: (e: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Registration failed");
        setLoading(false);
        return;
      }
      setParentEmail(email);
      setView("verify");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-center text-base font-semibold">Create Account</h2>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <input
        type="password"
        placeholder="Password (8+ chars, upper, lower, number, symbol)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <button
        onClick={handleRegister}
        disabled={loading || !email || !password || !firstName || !lastName}
        className="rounded bg-[#ff9900] py-2 text-sm font-semibold text-[#232f3e] disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
      <button
        onClick={() => {
          setError("");
          setView("login");
        }}
        className="text-xs text-[#0073bb] hover:underline"
      >
        Back to sign in
      </button>
    </div>
  );
}

function VerifyForm({
  email,
  setView,
  setError,
}: {
  email: string;
  setView: (v: View) => void;
  setError: (e: string) => void;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Verification failed");
        setLoading(false);
        return;
      }
      setView("login");
    } catch {
      setError("Network error");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-center text-base font-semibold">Verify Email</h2>
      <p className="text-center text-xs text-gray-500">Code sent to {email}</p>
      <input
        type="text"
        placeholder="6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleVerify()}
        maxLength={6}
        className="rounded border border-gray-300 px-3 py-2 text-center text-lg tracking-widest"
      />
      <button
        onClick={handleVerify}
        disabled={loading || code.length !== 6}
        className="rounded bg-[#ff9900] py-2 text-sm font-semibold text-[#232f3e] disabled:opacity-50"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>
      <button
        onClick={() => {
          setError("");
          setView("login");
        }}
        className="text-xs text-[#0073bb] hover:underline"
      >
        Back to sign in
      </button>
    </div>
  );
}

function AuthView({
  accounts,
  setView,
  onAccountAdded,
}: {
  accounts: AwsAccount[];
  setView: (v: View) => void;
  onAccountAdded: () => void;
}) {
  const [showAdd, setShowAdd] = useState(false);

  const handleSignOut = () => {
    chrome.runtime.sendMessage({ type: MessageType.CLEAR_AUTH_TOKEN });
    setView("login");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* AWS Accounts */}
      <h3 className="text-xs font-semibold uppercase text-gray-500">AWS Accounts</h3>
      {accounts.map((acc) => (
        <div key={acc.accountId} className="rounded border border-gray-200 p-2">
          <p className="text-sm font-medium">{acc.accountName}</p>
          <p className="text-xs text-gray-500">
            {acc.awsAccountId} · {acc.defaultRegion}
          </p>
        </div>
      ))}

      {showAdd ? (
        <AddAccountForm
          onSuccess={() => {
            setShowAdd(false);
            onAccountAdded();
          }}
          onCancel={() => setShowAdd(false)}
        />
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="rounded border-2 border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-[#ff9900] hover:text-[#ff9900]"
        >
          + Add AWS Account
        </button>
      )}

      {/* Sign Out */}
      <button
        onClick={handleSignOut}
        className="mt-2 rounded border border-red-200 py-1.5 text-xs text-red-600 hover:bg-red-50"
      >
        Sign Out
      </button>
      <p className="text-center text-xs text-gray-400">v0.1.0</p>
    </div>
  );
}

function AddAccountForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [name, setName] = useState("");
  const [keyId, setKeyId] = useState("");
  const [secret, setSecret] = useState("");
  const [region, setRegion] = useState("eu-west-2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    const result = await api.post("/accounts", {
      accountName: name,
      accessKeyId: keyId,
      secretAccessKey: secret,
      defaultRegion: region,
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
    <div className="rounded border border-[#ff9900] bg-orange-50 p-3">
      <h4 className="mb-2 text-sm font-semibold">Add AWS Account</h4>
      {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
      <div className="flex flex-col gap-2">
        <input
          placeholder="Account name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded border px-2 py-1.5 text-xs"
        />
        <input
          placeholder="Access Key ID (AKIA...)"
          value={keyId}
          onChange={(e) => setKeyId(e.target.value)}
          className="rounded border px-2 py-1.5 font-mono text-xs"
        />
        <input
          type="password"
          placeholder="Secret Access Key"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          className="rounded border px-2 py-1.5 font-mono text-xs"
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="rounded border px-2 py-1.5 text-xs"
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
            disabled={loading || !name || !keyId || !secret}
            className="flex-1 rounded bg-[#ff9900] py-1.5 text-xs font-semibold text-[#232f3e] disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Account"}
          </button>
          <button onClick={onCancel} className="rounded border px-3 py-1.5 text-xs text-gray-600">
            Cancel
          </button>
        </div>
        <p className="text-xs text-gray-400">Credentials encrypted with KMS.</p>
      </div>
    </div>
  );
}
