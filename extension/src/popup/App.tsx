import { useEffect, useState } from "react";

import { MessageType } from "@/shared/types/messages";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/v1";

type View = "loading" | "login" | "register" | "verify" | "authenticated";

interface AuthState {
  isAuthenticated: boolean;
  email: string;
}

export function App() {
  const [view, setView] = useState<View>("loading");
  const [auth, setAuth] = useState<AuthState>({
    isAuthenticated: false,
    email: "",
  });
  const [error, setError] = useState<string>("");

  useEffect(() => {
    chrome.runtime.sendMessage({ type: MessageType.GET_AUTH_TOKEN }, (response) => {
      if (response?.success) {
        setAuth({ isAuthenticated: true, email: "" });
        setView("authenticated");
      } else {
        setView("login");
      }
    });
  }, []);

  if (view === "loading") {
    return (
      <div className="flex h-[400px] w-[350px] items-center justify-center">
        <div className="text-sm text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-[450px] w-[350px] overflow-y-auto">
      <div className="flex items-center gap-2 border-b border-gray-200 bg-[#232f3e] px-4 py-3">
        <span className="text-lg">⚡</span>
        <h1 className="text-base font-semibold text-white">AWS Console Better</h1>
      </div>

      <div className="p-4">
        {error && <div className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-600">{error}</div>}

        {view === "login" && <LoginView setView={setView} setAuth={setAuth} setError={setError} />}
        {view === "register" && (
          <RegisterView setView={setView} setAuth={setAuth} setError={setError} />
        )}
        {view === "verify" && (
          <VerifyView email={auth.email} setView={setView} setError={setError} />
        )}
        {view === "authenticated" && <AuthenticatedView setView={setView} setAuth={setAuth} />}
      </div>
    </div>
  );
}

function LoginView({
  setView,
  setAuth,
  setError,
}: {
  setView: (v: View) => void;
  setAuth: (a: AuthState) => void;
  setError: (e: string) => void;
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

      // Store tokens via background service worker
      chrome.runtime.sendMessage({
        type: MessageType.SET_AUTH_TOKEN,
        payload: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          expiresIn: data.expiresIn,
        },
      });

      setAuth({ isAuthenticated: true, email });
      setView("authenticated");
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Sign In</h2>
        <p className="mt-1 text-xs text-gray-500">Sign in to your AWS Console Better account</p>
      </div>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ff9900] focus:outline-none"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ff9900] focus:outline-none"
      />

      <button
        onClick={handleLogin}
        disabled={loading || !email || !password}
        className="rounded-lg bg-[#ff9900] px-4 py-2.5 text-sm font-semibold text-[#232f3e] transition-colors hover:bg-[#ec7211] disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <button
        onClick={() => {
          setError("");
          setView("register");
        }}
        className="text-xs text-[#0073bb] hover:underline"
      >
        Don't have an account? Create one
      </button>
    </div>
  );
}

function RegisterView({
  setView,
  setAuth,
  setError,
}: {
  setView: (v: View) => void;
  setAuth: (a: AuthState) => void;
  setError: (e: string) => void;
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

      setAuth({ isAuthenticated: false, email });
      setView("verify");
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Create Account</h2>
        <p className="mt-1 text-xs text-gray-500">Sign up for AWS Console Better</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ff9900] focus:outline-none"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ff9900] focus:outline-none"
        />
      </div>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ff9900] focus:outline-none"
      />
      <input
        type="password"
        placeholder="Password (min 8 chars, upper, lower, number, symbol)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#ff9900] focus:outline-none"
      />

      <button
        onClick={handleRegister}
        disabled={loading || !email || !password || !firstName || !lastName}
        className="rounded-lg bg-[#ff9900] px-4 py-2.5 text-sm font-semibold text-[#232f3e] transition-colors hover:bg-[#ec7211] disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>

      <button
        onClick={() => {
          setError("");
          setView("login");
        }}
        className="text-xs text-[#0073bb] hover:underline"
      >
        Already have an account? Sign in
      </button>
    </div>
  );
}

function VerifyView({
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
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-900">Verify Email</h2>
        <p className="mt-1 text-xs text-gray-500">Enter the 6-digit code sent to {email}</p>
      </div>

      <input
        type="text"
        placeholder="Verification code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleVerify()}
        maxLength={6}
        className="rounded-lg border border-gray-300 px-3 py-2 text-center text-lg tracking-widest focus:border-[#ff9900] focus:outline-none"
      />

      <button
        onClick={handleVerify}
        disabled={loading || code.length !== 6}
        className="rounded-lg bg-[#ff9900] px-4 py-2.5 text-sm font-semibold text-[#232f3e] transition-colors hover:bg-[#ec7211] disabled:opacity-50"
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

function AuthenticatedView({
  setView,
  setAuth,
}: {
  setView: (v: View) => void;
  setAuth: (a: AuthState) => void;
}) {
  const openSidePanel = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.sidePanel.open({ tabId: tabs[0].id });
      }
    });
  };

  const handleSignOut = () => {
    chrome.runtime.sendMessage({ type: MessageType.CLEAR_AUTH_TOKEN });
    setAuth({ isAuthenticated: false, email: "" });
    setView("login");
  };

  return (
    <div className="flex flex-col gap-3">
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

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
          AWS Account
        </h3>
        <div className="rounded-lg border border-gray-200 px-3 py-2">
          <p className="text-sm font-medium text-gray-900">No account linked</p>
          <p className="text-xs text-gray-500">Add an AWS account in settings</p>
        </div>
      </div>

      <button
        onClick={handleSignOut}
        className="mt-2 rounded-lg border border-red-200 px-4 py-2 text-center text-xs text-red-600 transition-colors hover:bg-red-50"
      >
        Sign Out
      </button>
    </div>
  );
}
