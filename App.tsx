import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Zap, RotateCcw } from 'lucide-react';
import { Header } from './components/Header';
import { CardItem } from './components/CardItem';
import { CameraCapture } from './components/CameraCapture';
import { EditCardModal } from './components/EditCardModal';
import { SettingsModal } from './components/SettingsModal';
import { AlphabetIndex } from './components/AlphabetIndex';
import { analyzeCardImage } from './services/geminiService';
import { getCards, saveCard, deleteCard, mockSyncToSheets, getApiKey } from './services/storageService';
import { CardData, User, ProcessingStatus } from './types';

// Mock User Data
const MOCK_USER: User = {
  name: "Alex Developer",
  email: "alex@cardsnap.app",
  avatar: "https://picsum.photos/200"
};

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl max-w-sm w-full p-6 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">{title}</h3>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6 text-sm">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-sm font-medium transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [cards, setCards] = useState<CardData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [editingCard, setEditingCard] = useState<CardData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error', onUndo?: () => void} | null>(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // Delete Logic States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [lastDeletedCard, setLastDeletedCard] = useState<CardData | null>(null);

  // Theme Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    setCards(getCards());
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  const showNotification = (message: string, type: 'success' | 'error' = 'success', onUndo?: () => void) => {
    setNotification({ message, type, onUndo });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCapture = async (file: File) => {
    setIsProcessing(true);
    setProcessingStatus(ProcessingStatus.PROCESSING);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        
        const newCard: CardData = {
          id: uuidv4(),
          imageUri: base64Image,
          name: "Processing...",
          company: "Analyzing card...",
          phone: [],
          email: [],
          website: null,
          description: null,
          tags: ["pending"],
          notes: "",
          nickname: null,
          createdAt: new Date().toISOString(),
          processedAt: null,
          lastSyncedAt: null,
          isSyncing: true
        };

        setCards(saveCard(newCard));

        try {
          const extractedData = await analyzeCardImage(base64Image);
          
          const updatedCard: CardData = {
            ...newCard,
            ...extractedData,
            processedAt: new Date().toISOString(),
            isSyncing: false
          };
          
          setCards(saveCard(updatedCard));
          setProcessingStatus(ProcessingStatus.SUCCESS);
          showNotification("Card processed successfully");
          
          setEditingCard(updatedCard);

          if (user) {
            handleSync(updatedCard);
          }

        } catch (error: any) {
          console.error("Analysis Failed", error);
          const errorCard = {
            ...newCard,
            name: "Scan Failed",
            company: "Could not extract data",
            tags: ["error"],
            isSyncing: false
          };
          setCards(saveCard(errorCard));
          setProcessingStatus(ProcessingStatus.ERROR);
          showNotification(`Analysis failed: ${error.message || 'Unknown error'}`, 'error');
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  const handleSync = async (card: CardData) => {
    if (!user) return;
    const syncingCard = { ...card, isSyncing: true };
    setCards(saveCard(syncingCard));
    await mockSyncToSheets(card);
    const syncedCard = { ...card, isSyncing: false, lastSyncedAt: new Date().toISOString() };
    setCards(saveCard(syncedCard));
  };

  const handleSaveEdit = (updatedCard: CardData) => {
    setCards(saveCard(updatedCard));
    showNotification("Changes saved");
    if (user) {
      handleSync(updatedCard);
    }
  };

  // Updates card silently (e.g. for notes) without closing UI or big notifications if not needed
  const handleQuickUpdate = (updatedCard: CardData) => {
    setCards(saveCard(updatedCard));
  };

  const promptDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (!deleteId) return;
    
    const cardToDelete = cards.find(c => c.id === deleteId);
    if (cardToDelete) {
      setLastDeletedCard(cardToDelete);
      setCards(deleteCard(deleteId));
      
      showNotification(
        "Card deleted", 
        "success", 
        () => {
          if (cardToDelete) {
            setCards(saveCard(cardToDelete));
            setLastDeletedCard(null);
            showNotification("Delete undone");
          }
        }
      );
    }
    
    setDeleteId(null);
  };

  const filteredCards = cards.filter(card => {
    const q = searchQuery.toLowerCase();
    return (
      (card.name?.toLowerCase().includes(q)) ||
      (card.company?.toLowerCase().includes(q)) ||
      (card.tags?.some(tag => tag.toLowerCase().includes(q)))
    );
  });

  const groupedCards = React.useMemo<Record<string, CardData[]>>(() => {
    const groups: Record<string, CardData[]> = {};
    filteredCards.forEach(card => {
      const firstLetter = (card.name?.[0] || '#').toUpperCase();
      const key = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(card);
    });
    
    const sortedKeys = Object.keys(groups).sort();
    const result: Record<string, CardData[]> = {};
    sortedKeys.forEach(key => {
      result[key] = groups[key].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    });
    return result;
  }, [filteredCards]);

  const handleScrollToLetter = (letter: string) => {
    const element = document.getElementById(`section-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCameraActivate = () => {
    const key = getApiKey();
    if (!key) {
      showNotification("Please set your Gemini API Key in Settings to scan cards.", 'error');
      setIsSettingsOpen(true);
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen pb-24 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Header 
        onSearch={setSearchQuery} 
        onOpenSettings={() => setIsSettingsOpen(true)}
        user={user}
        darkMode={darkMode}
        onToggleTheme={toggleTheme}
      />

      <main className="max-w-xl mx-auto px-4 pt-6 relative">
        
        {isProcessing && (
          <div className="mb-6 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center gap-3 shadow-sm animate-pulse">
            <Loader2 className="animate-spin text-zinc-900 dark:text-zinc-100" />
            <span className="font-medium text-zinc-600 dark:text-zinc-300">Analyzing card...</span>
          </div>
        )}

        {!isProcessing && filteredCards.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-zinc-100 dark:bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
              <Zap className="text-zinc-400 dark:text-zinc-500" size={32} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No cards yet</h2>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto text-sm">
              Tap the camera button to snap your first business card.
            </p>
          </div>
        )}

        {Object.keys(groupedCards).length > 0 && (
          <AlphabetIndex letters={Object.keys(groupedCards)} onSelect={handleScrollToLetter} />
        )}

        <div className="space-y-8 pb-12 pr-6">
          {(Object.entries(groupedCards) as [string, CardData[]][]).map(([letter, group]) => (
            <div key={letter} id={`section-${letter}`} className="scroll-mt-24">
              <div className="flex items-center gap-4 mb-4">
                 <h2 className="text-zinc-400 dark:text-zinc-600 font-bold text-xs uppercase tracking-widest">{letter}</h2>
                 <div className="h-px bg-zinc-200 dark:bg-zinc-800 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {group.map(card => (
                  <CardItem 
                    key={card.id} 
                    card={card} 
                    onEdit={setEditingCard}
                    onDelete={promptDelete}
                    onUpdate={handleQuickUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <CameraCapture 
        onCapture={handleCapture} 
        disabled={isProcessing} 
        onActivate={handleCameraActivate}
      />

      {editingCard && (
        <EditCardModal 
          card={editingCard}
          isOpen={!!editingCard}
          onClose={() => setEditingCard(null)}
          onSave={handleSaveEdit}
        />
      )}

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        user={user}
        onLogin={() => { setUser(MOCK_USER); showNotification("Signed in successfully"); }}
        onLogout={() => { setUser(null); showNotification("Signed out"); }}
        cardCount={cards.length}
      />
      
      <ConfirmationModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Card"
        message="Are you sure you want to permanently delete this business card?"
      />

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full shadow-xl text-white text-sm font-medium z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 flex items-center gap-4 ${notification.type === 'error' ? 'bg-red-500' : 'bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900'}`}>
          <span>{notification.message}</span>
          {notification.onUndo && (
            <button 
              onClick={() => { notification.onUndo!(); setNotification(null); }}
              className="px-2 py-1 bg-white/20 dark:bg-black/10 hover:bg-white/30 rounded text-xs font-bold flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} /> UNDO
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default App;