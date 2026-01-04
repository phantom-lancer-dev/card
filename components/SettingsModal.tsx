import React, { useState, useEffect } from 'react';
import { X, LogOut, CheckCircle, UserCircle, Database, ShieldCheck, Key, AlertCircle, Loader2 } from 'lucide-react';
import { User } from '../types';
import { getApiKey, saveApiKey } from '../services/storageService';
import { validateGeminiApiKey } from '../services/geminiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  cardCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, user, onLogin, onLogout, cardCount 
}) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  useEffect(() => {
    if (isOpen) {
      const stored = getApiKey();
      if (stored) {
        setApiKey(stored);
        setValidationStatus('valid');
      } else {
        setApiKey('');
        setValidationStatus('idle');
      }
    }
  }, [isOpen]);

  const handleValidateAndSave = async () => {
    if (!apiKey.trim()) return;
    setIsValidating(true);
    setValidationStatus('idle');
    const isValid = await validateGeminiApiKey(apiKey);
    setIsValidating(false);
    if (isValid) {
      setValidationStatus('valid');
      saveApiKey(apiKey);
    } else {
      setValidationStatus('invalid');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 rounded-xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-500">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-8 overflow-y-auto">
          
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Key size={14} /> Gemini API Key
            </h3>
            
            <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800 space-y-3">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Stored locally on your device.
              </p>
              
              <div className="space-y-2">
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setValidationStatus('idle');
                  }}
                  placeholder="Paste AI Studio API Key"
                  className={`w-full p-3 text-sm bg-white dark:bg-zinc-950 border rounded-lg outline-none transition-all font-mono text-zinc-900 dark:text-zinc-100 ${
                    validationStatus === 'invalid' 
                      ? 'border-red-300 focus:ring-1 focus:ring-red-400' 
                      : 'border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600'
                  }`}
                />
                
                {validationStatus === 'invalid' && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle size={12} /> Invalid API Key.
                  </p>
                )}
              </div>

              <button 
                onClick={handleValidateAndSave}
                disabled={isValidating || !apiKey}
                className={`w-full py-2 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  validationStatus === 'valid'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                    : 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 disabled:opacity-50'
                }`}
              >
                {isValidating ? (
                  <><Loader2 size={16} className="animate-spin" /> Checking...</>
                ) : validationStatus === 'valid' ? (
                  <><CheckCircle size={16} /> Saved</>
                ) : (
                  'Save Key'
                )}
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Account</h3>
            
            {user ? (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4 mb-4">
                  <img src={user.avatar} alt="User" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{user.name}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                </div>
                <button 
                  onClick={onLogout}
                  className="w-full py-2 px-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-6 border border-zinc-100 dark:border-zinc-800 text-center space-y-3">
                <div className="w-10 h-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <UserCircle className="text-zinc-400" size={24} />
                </div>
                <p className="text-xs text-zinc-500">
                  Sign in to sync with Google Sheets.
                </p>
                <button 
                  onClick={onLogin}
                  className="w-full py-2.5 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all text-sm flex items-center justify-center gap-2"
                >
                   Sign in with Google
                </button>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 flex flex-col items-center">
                <span className="text-xl font-bold text-zinc-900 dark:text-white">{cardCount}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Cards</span>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800 flex flex-col items-center">
                <Database size={20} className="text-zinc-400 mb-1" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-wide">Local</span>
              </div>
            </div>
          </section>

           <div className="flex items-center justify-center gap-2 text-zinc-400 text-[10px] mt-4">
              <ShieldCheck size={12} />
              <span>Local-First Architecture</span>
           </div>

        </div>
      </div>
    </div>
  );
};