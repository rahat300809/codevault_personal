import React, { useState } from 'react';
import { X, Code2, Sparkles } from 'lucide-react';
import { NewSnippet, Folder } from '../types';
import { motion } from 'motion/react';

interface SnippetFormProps {
  onSubmit: (snippet: NewSnippet) => void;
  onClose: () => void;
  initialData?: Partial<NewSnippet>;
  folders: Folder[];
  currentFolderId: string | null;
}

const LANGUAGES = [
  'c', 'cpp', 'csharp', 'css', 'go', 'html', 'java', 'javascript', 'markdown', 'php', 'python', 'rust', 'sql', 'typescript'
];

export function SnippetForm({ onSubmit, onClose, initialData, folders, currentFolderId }: SnippetFormProps) {
  const [formData, setFormData] = useState<NewSnippet>({
    title: initialData?.title || '',
    code: initialData?.code || '',
    language: initialData?.language || 'c',
    description: initialData?.description || '',
    tags: initialData?.tags || [],
    folderId: initialData?.folderId || currentFolderId || '',
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.code) return;
    onSubmit(formData);
    onClose();
  };

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
        onClick={e => e.stopPropagation()}
        className="glass-card rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-white/10"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              {initialData ? <Code2 size={20} className="text-white" /> : <Sparkles size={20} className="text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {initialData ? 'Edit Snippet' : 'Create New Snippet'}
              </h2>
              <p className="text-xs text-white/30">Save your code to the vault</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/40 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-thin">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-white/20"
                placeholder="e.g. Binary Search"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Language</label>
              <select
                value={formData.language}
                onChange={e => setFormData({ ...formData, language: e.target.value })}
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-all appearance-none cursor-pointer capitalize"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang} className="bg-[#151619] capitalize">{lang}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Folder selector */}
          {folders.length > 0 && (
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">📁 Save to Folder</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, folderId: '' })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${!formData.folderId
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'border-white/5 text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                >
                  No Folder
                </button>
                {folders.map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, folderId: f.id })}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5"
                    style={{
                      borderColor: formData.folderId === f.id ? f.color + '60' : 'rgba(255,255,255,0.05)',
                      backgroundColor: formData.folderId === f.id ? f.color + '15' : 'transparent',
                      color: formData.folderId === f.id ? f.color : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: f.color }} />
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all h-20 resize-none placeholder:text-white/20"
              placeholder="What does this code do?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Code *</label>
            <textarea
              required
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value })}
              className="w-full bg-[#08090b] border border-white/10 rounded-xl px-4 py-3 text-emerald-300 font-mono text-[13px] leading-relaxed focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all h-52 resize-none placeholder:text-white/15"
              placeholder="// Paste your code here..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <span key={tag} className="bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-emerald-500/20">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/40 transition-all placeholder:text-white/20"
                placeholder="Type a tag and press Enter..."
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/50 hover:text-white hover:bg-white/5 transition-all font-medium text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/25 transition-all text-sm active:scale-[0.98]"
            >
              {initialData ? '✓ Save Changes' : '⚡ Create Snippet'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
