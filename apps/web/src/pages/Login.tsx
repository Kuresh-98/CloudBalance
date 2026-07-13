import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { Landmark, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from "lucide-react";

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect to redirect parameter or home
  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Failed to log in"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8 font-sans">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md mb-4">
            <Landmark className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-text">
            CloudBalance
          </h2>
          <p className="mt-2 text-sm text-textMuted">
            Cloud Cost Intelligence Platform
          </p>
        </div>

        {/* Card containing login form */}
        <div className="bg-white border border-border rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-semibold tracking-tight text-text mb-1">
            Welcome back
          </h3>
          <p className="text-sm text-textMuted mb-6">
            Log in to view cloud infrastructure optimization opportunities
          </p>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3 py-2 text-sm rounded-md border border-border bg-white text-text placeholder:text-textMuted/45 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider text-textMuted mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-textMuted">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2 text-sm rounded-md border border-border bg-white text-text placeholder:text-textMuted/45 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-textMuted hover:text-text focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 font-medium py-2 px-4 text-sm rounded-lg bg-primary text-white hover:bg-primary-hover shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {loading ? "Logging in..." : "Log in"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-sm">
            <span className="text-textMuted">Don't have an account? </span>
            <Link
              to="/signup"
              className="font-medium text-primary hover:text-primary-hover focus:outline-none focus:underline"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Demo Credentials Alert */}
        <div className="mt-4 bg-slate-50 border border-border rounded-lg p-3 text-xs text-textMuted flex flex-col gap-1">
          <div className="font-semibold text-text">Demo Credentials:</div>
          <div>Email: <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">admin@cloudbalance.com</code></div>
          <div>Password: <code className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">Password123!</code></div>
        </div>
      </div>
    </div>
  );
};
