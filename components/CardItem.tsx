import React, { useState, useEffect } from 'react';
import { Phone, Mail, Globe, Share2, Trash2, Copy, Check, Edit2, ChevronDown, Tag, PenLine } from 'lucide-react';
import { CardData } from '../types';

interface CardItemProps {
  card: CardData;
  onEdit: (card: CardData) => void;
  onDelete: (id: string) => void;
  onUpdate?: (card: CardData) => void;
}

export const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [translateX, setTranslateX] = useState(0);
  
  // Note editing state
  const [noteText, setNoteText] = useState(card.notes || "");
  
  useEffect(() => {
      setNoteText(card.notes || "");
  }, [card.notes]);

  // Swipe Constants
  const minSwipeDistance = 75;

  const onTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    // Prevent swipe if interacting with controls or note textarea
    if (target.closest('button') || target.closest('a') || target.closest('textarea')) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTranslateX(0);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart) return;
    setTouchEnd(e.targetTouches[0].clientX);
    const delta = e.targetTouches[0].clientX - touchStart;
    if (Math.abs(delta) < 150) {
      setTranslateX(delta);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setTranslateX(0);
      return;
    }
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    setTranslateX(0);
    setTouchStart(null);

    if (isLeftSwipe) onDelete(card.id);
    else if (isRightSwipe) onEdit(card);
  };

  const handleCopy = (e: React.MouseEvent, text: string | null, field: string) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const phones = card.phone.join(', ');
    const emails = card.email.join(', ');
    const shareText = [
      card.name,
      card.company,
      card.description,
      phones ? `Tel: ${phones}` : null,
      emails ? `Email: ${emails}` : null,
      card.website ? `Web: ${card.website}` : null
    ].filter(Boolean).join('\n');

    const shareData: ShareData = { title: card.name || 'Business Card', text: shareText };
    try {
      if (navigator.share) await navigator.share(shareData);
      else throw new Error("Web Share API not supported");
    } catch (err) {
      navigator.clipboard.writeText(shareText);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  // Handle Note Changes
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteText(e.target.value);
  };

  const handleNoteBlur = () => {
    if (onUpdate && noteText !== card.notes) {
      onUpdate({ ...card, notes: noteText });
    }
  };

  // Improved Random Hash Color
  const getAccentColor = (id: string, name: string) => {
    const colors = [
      'bg-indigo-500', 'bg-blue-500', 'bg-green-500', 'bg-red-500', 
      'bg-orange-500', 'bg-teal-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-cyan-500', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-500'
    ];
    
    // Create a simple hash from ID and Name to ensure consistency
    const str = (id + name);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const accentClass = `absolute left-0 top-0 bottom-0 w-1.5 ${getAccentColor(card.id, card.name || '')}`;

  return (
    <div 
      className="relative w-full group select-none touch-pan-y"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Swipe Feedback */}
      <div className="absolute inset-0 rounded-lg flex items-center justify-between px-6 z-0 overflow-hidden">
        <div 
          className="flex items-center gap-2 font-bold text-sm text-zinc-500 dark:text-zinc-400 transition-opacity duration-300"
          style={{ opacity: translateX > 50 ? 1 : 0 }}
        >
          <Edit2 size={18} /> EDIT
        </div>
        <div 
          className="flex items-center gap-2 font-bold text-sm text-red-500 transition-opacity duration-300"
          style={{ opacity: translateX < -50 ? 1 : 0 }}
        >
          DELETE <Trash2 size={18} />
        </div>
      </div>

      {/* Main Card */}
      <div 
        className="relative bg-white dark:bg-zinc-900 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden transition-all duration-300 ease-out hover:shadow-md"
        style={{ transform: `translateX(${translateX}px)` }}
      >
        <div className={accentClass}></div>

        <div className="pl-5 pr-4 py-4 flex flex-col h-full relative">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pl-1 pt-1">
            <div className="pr-8 cursor-pointer w-full" onClick={toggleExpand}>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-tight mb-1">
                {card.name || "Unknown Name"}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs font-semibold uppercase tracking-wider mb-1">
                {card.company || "Unknown Company"}
              </p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs font-medium">
                 {card.description}
              </p>
            </div>
            
            <button 
              onClick={handleShare}
              className="p-2 -mr-2 text-zinc-300 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-zinc-100 transition-colors"
            >
              <Share2 size={18} />
            </button>
          </div>

          {/* Contact List */}
          <div className="flex flex-col gap-2">
            
            {/* Phone Numbers */}
            {card.phone.map((ph, idx) => (
              <div key={`phone-${idx}`} className="flex items-center justify-between group/row relative z-20">
                <a 
                  href={`tel:${ph}`} 
                  onClick={stopProp}
                  className="flex items-center gap-3 flex-1 min-w-0 py-2 px-2 -ml-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                    <Phone size={14} />
                  </div>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono truncate">
                    {ph}
                  </span>
                </a>
                <button 
                  onClick={(e) => handleCopy(e, ph, `phone-${idx}`)}
                  className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-white rounded transition-colors ml-1 self-center"
                >
                  {copiedField === `phone-${idx}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            ))}

            {/* Emails */}
            {card.email.map((em, idx) => (
              <div key={`email-${idx}`} className="flex items-center justify-between group/row relative z-20">
                <a 
                  href={`mailto:${em}`} 
                  onClick={stopProp}
                  className="flex items-center gap-3 flex-1 min-w-0 py-2 px-2 -ml-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                    <Mail size={14} />
                  </div>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono truncate">
                    {em}
                  </span>
                </a>
                <button 
                  onClick={(e) => handleCopy(e, em, `email-${idx}`)}
                  className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-white rounded transition-colors ml-1 self-center"
                >
                  {copiedField === `email-${idx}` ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            ))}

            {/* Website */}
            {card.website && (
              <div className="flex items-center justify-between group/row relative z-20">
                <a 
                  href={card.website.startsWith('http') ? card.website : `https://${card.website}`} 
                  target="_blank" 
                  rel="noreferrer"
                  onClick={stopProp}
                  className="flex items-center gap-3 flex-1 min-w-0 py-2 px-2 -ml-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 active:bg-zinc-100 dark:active:bg-zinc-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                    <Globe size={14} />
                  </div>
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono break-all">
                    {card.website.replace(/^https?:\/\//, '')}
                  </span>
                </a>
                <button 
                  onClick={(e) => handleCopy(e, card.website, 'website')}
                  className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-zinc-900 dark:text-zinc-600 dark:hover:text-white rounded transition-colors ml-1 self-center"
                >
                  {copiedField === 'website' ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            )}
          </div>

          {/* Expand Trigger */}
          <div 
            onClick={toggleExpand}
            className="mt-4 pt-2 flex items-center justify-center cursor-pointer group/expand opacity-60 hover:opacity-100 transition-opacity"
          >
            <div className={`h-1 w-8 rounded-full transition-colors ${isExpanded ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-zinc-100 dark:bg-zinc-800'}`}></div>
          </div>

          {/* Expanded Content */}
          <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
            <div className="overflow-hidden">
               <div className="pt-4 pb-1 pl-1 space-y-4">
                 
                 {card.tags.length > 0 && (
                   <div className="flex flex-wrap gap-2">
                      {card.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-medium border border-zinc-200 dark:border-zinc-700 uppercase tracking-wide">
                          <Tag size={10} /> {tag}
                        </span>
                      ))}
                   </div>
                 )}

                 {/* Editable Notes Section */}
                 <div className="group/notes relative">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1 block pl-1">
                        Notes
                    </label>
                    <textarea 
                        value={noteText}
                        onChange={handleNoteChange}
                        onBlur={handleNoteBlur}
                        placeholder="Add notes..."
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3 border border-zinc-100 dark:border-zinc-800 text-sm text-zinc-700 dark:text-zinc-300 font-mono focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-600 outline-none resize-y min-h-[100px] transition-colors"
                    />
                    <div className="absolute top-8 right-2 pointer-events-none opacity-0 group-hover/notes:opacity-100 transition-opacity text-zinc-400">
                        <PenLine size={12} />
                    </div>
                 </div>

                 <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
                      className="px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      DELETE
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                      className="px-3 py-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                    >
                      EDIT DETAILS
                    </button>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};