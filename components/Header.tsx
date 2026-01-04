import React from 'react';
import { Search, Settings, User as UserIcon, Moon, Sun } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  onSearch: (query: string) => void;
  onOpenSettings: () => void;
  user: User | null;
  darkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearch, onOpenSettings, user, darkMode, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-40 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-4 py-4 transition-colors duration-300">
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-zinc-600 dark:group-focus-within:text-zinc-300 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-700 outline-none transition-all placeholder:text-zinc-400"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2.5 rounded-lg text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User/Settings Button */}
        <button 
          onClick={onOpenSettings}
          className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors relative flex-shrink-0"
        >
          {user ? (
            <img 
              src={user.avatar} 
              alt={user.name} 
              className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700"
            />
          ) : (
            <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-500 dark:text-zinc-400">
              <Settings size={18} />
            </div>
          )}
          {user && (
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-zinc-950 rounded-full"></div>
          )}
        </button>
      </div>
    </header>
  );
};