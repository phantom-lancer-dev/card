import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Tag as TagIcon, Plus, Minus } from 'lucide-react';
import { CardData } from '../types';

interface EditCardModalProps {
  card: CardData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCard: CardData) => void;
}

export const EditCardModal: React.FC<EditCardModalProps> = ({ card, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<CardData>(card);
  const [tagInput, setTagInput] = useState('');
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setFormData(card);
  }, [card]);

  if (!isOpen) return null;

  const handleChange = (field: keyof CardData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Generic handler for array inputs (phone, email)
  const handleArrayChange = (field: 'phone' | 'email', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const addArrayField = (field: 'phone' | 'email') => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayField = (field: 'phone' | 'email', index: number) => {
    setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Filter out empty phones/emails
    const cleanedData = {
        ...formData,
        phone: formData.phone.filter(p => p.trim() !== ''),
        email: formData.email.filter(e => e.trim() !== '')
    };
    onSave(cleanedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-950 rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-zinc-200 dark:border-zinc-800">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">Edit Contact</h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition-colors text-zinc-500">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center mb-2">
            <img 
              src={formData.imageUri} 
              alt="Card Preview" 
              className="h-32 object-contain rounded border border-zinc-200 dark:border-zinc-800"
            />
          </div>

          <form id="edit-form" onSubmit={handleSubmit} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['name', 'company'].map((field) => (
                <div key={field} className="space-y-1">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{field}</label>
                  <input
                    type="text"
                    value={formData[field as keyof CardData] as string || ''}
                    onChange={e => handleChange(field as keyof CardData, e.target.value)}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-sm text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Job Title</label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={e => handleChange('description', e.target.value)}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {/* Dynamic Phone Fields */}
            <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Phone Numbers</label>
                    <button type="button" onClick={() => addArrayField('phone')} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline">
                        <Plus size={12}/> Add
                    </button>
                 </div>
                 {formData.phone.map((ph, idx) => (
                     <div key={`phone-input-${idx}`} className="flex gap-2">
                        <input
                            type="text"
                            value={ph}
                            onChange={e => handleArrayChange('phone', idx, e.target.value)}
                            className="flex-1 p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-sm text-zinc-900 dark:text-zinc-100 font-mono"
                            placeholder="Phone number"
                        />
                        <button type="button" onClick={() => removeArrayField('phone', idx)} className="p-2 text-zinc-400 hover:text-red-500">
                            <Minus size={16} />
                        </button>
                     </div>
                 ))}
                 {formData.phone.length === 0 && (
                     <p className="text-xs text-zinc-400 italic">No phone numbers added.</p>
                 )}
            </div>

            {/* Dynamic Email Fields */}
            <div className="space-y-2">
                 <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Emails</label>
                    <button type="button" onClick={() => addArrayField('email')} className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline">
                        <Plus size={12}/> Add
                    </button>
                 </div>
                 {formData.email.map((em, idx) => (
                     <div key={`email-input-${idx}`} className="flex gap-2">
                        <input
                            type="text"
                            value={em}
                            onChange={e => handleArrayChange('email', idx, e.target.value)}
                            className="flex-1 p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-sm text-zinc-900 dark:text-zinc-100 font-mono"
                            placeholder="Email address"
                        />
                        <button type="button" onClick={() => removeArrayField('email', idx)} className="p-2 text-zinc-400 hover:text-red-500">
                            <Minus size={16} />
                        </button>
                     </div>
                 ))}
                 {formData.email.length === 0 && (
                     <p className="text-xs text-zinc-400 italic">No emails added.</p>
                 )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Website</label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={e => handleChange('website', e.target.value)}
                className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-sm text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Tags</label>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <span key={tag} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 border border-zinc-200 dark:border-zinc-700">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <TagIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full p-2.5 pl-9 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-sm text-zinc-900 dark:text-zinc-100"
                  placeholder="Add tags..."
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Notes (also editable in card)</label>
              <textarea
                ref={notesRef}
                value={formData.notes || ''}
                onChange={e => handleChange('notes', e.target.value)}
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 outline-none text-sm h-24 resize-none placeholder-zinc-400 text-zinc-900 dark:text-zinc-100 font-mono"
                placeholder="Add context..."
              />
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-3 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-xl">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="edit-form"
            className="px-5 py-2 text-sm font-bold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg transition-all flex items-center gap-2"
          >
            <Save size={16} /> Save
          </button>
        </div>
      </div>
    </div>
  );
};