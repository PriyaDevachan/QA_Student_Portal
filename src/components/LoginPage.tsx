import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Lock, Mail, ArrowRight, ShieldCheck, Database, KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('admin@academy.edu');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail) {
      setErrorMessage('Please enter an administrator email address.');
      return;
    }
    if (!cleanPass) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const result = await login(cleanEmail, cleanPass);
      if (!result.success) {
        setErrorMessage(result.error || 'Invalid credentials. Check email and password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setLoading(true);
    setErrorMessage(null);
    setEmail('admin@academy.edu');
    setPassword('admin123');
    try {
      const result = await quickDemoLogin();
      if (!result.success) {
        setErrorMessage(result.error || 'Demo login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Campus Image with Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/student_portal_campus_1792176986963.jpg"
          alt="University Campus Quad"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover filter brightness-[0.4] saturate-[0.85]"
        />
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-slate-900 border border-slate-700 text-white shadow-xl mb-4">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            AcademyOS
          </h1>
          <p className="mt-2 text-sm text-slate-300">
            Student Management & Academic Records Portal
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl border border-slate-200/80 p-8">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-800 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Authentication Error</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Administrator Email
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@academy.edu"
                  autoComplete="username"
                  required
                  className="block w-full pl-9 pr-3 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  autoComplete="current-password"
                  required
                  className="block w-full pl-9 pr-10 py-2 text-sm text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoClick}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-600" />
                <span>Instant Demo Login (admin@academy.edu)</span>
              </button>
            </div>
          </form>

          {/* Preset credentials reference box */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium mb-1">
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>Default Administrator Credentials</span>
            </div>
            <div className="font-mono text-[11px] bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-600 mt-1 space-y-1">
              <div className="flex items-center justify-between">
                <span>Email:</span>
                <code className="font-bold text-slate-900 bg-slate-200/60 px-1.5 py-0.5 rounded">admin@academy.edu</code>
              </div>
              <div className="flex items-center justify-between">
                <span>Password:</span>
                <code className="font-bold text-slate-900 bg-slate-200/60 px-1.5 py-0.5 rounded">admin123</code>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 text-center">
              Clicking <strong>Instant Demo Login</strong> automatically signs in with default credentials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
