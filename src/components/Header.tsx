import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { LogOut, Database, Code, Users, BarChart3 } from 'lucide-react';

interface HeaderProps {
  currentTab: 'students' | 'analytics' | 'api-explorer' | 'db-status';
  onSelectTab: (tab: 'students' | 'analytics' | 'api-explorer' | 'db-status') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => onSelectTab('students')}
            className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tighter">
              OS
            </div>
            <span>AcademyOS</span>
          </button>

          {/* Zone 2: 4 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('students')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'students'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students</span>
            </button>

            <button
              onClick={() => onSelectTab('analytics')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'analytics'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => onSelectTab('api-explorer')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'api-explorer'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>REST APIs</span>
            </button>

            <button
              onClick={() => onSelectTab('db-status')}
              className={`flex items-center gap-2 py-1 transition-colors whitespace-nowrap shrink-0 ${
                currentTab === 'db-status'
                  ? 'text-slate-900 font-semibold border-b-2 border-slate-900'
                  : 'hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>MongoDB Engine</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action / user profile */}
          <div className="flex items-center gap-3 shrink-0">
            {user && (
              <div className="hidden sm:flex items-center gap-2 text-right">
                <div className="text-xs">
                  <div className="font-semibold text-slate-800 leading-tight">{user.name}</div>
                  <div className="text-slate-500 text-[11px]">{user.role}</div>
                </div>
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-slate-200"
                  onError={(e) => {
                    // Fallback to initials if image doesn't load
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}
            <button
              onClick={logout}
              title="Sign out of portal"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
