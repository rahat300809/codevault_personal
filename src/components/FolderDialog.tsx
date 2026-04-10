import React, { useState } from 'react';
import { X, FolderPlus, Palette } from 'lucide-react';
import { NewFolder } from '../types';
import { motion } from 'motion/react';

interface FolderDialogProps {
    onSubmit: (folder: NewFolder) => void;
    onClose: () => void;
}

const COLORS = [
    '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444',
    '#ec4899', '#06b6d4', '#f97316', '#84cc16', '#6366f1',
];

export function FolderDialog({ onSubmit, onClose }: FolderDialogProps) {
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({ name: name.trim(), color });
        onClose();
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
                className="glass-card rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-white/10"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-500/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                            <FolderPlus size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Create Folder</h2>
                            <p className="text-xs text-white/30">Add a folder for a friend or project</p>
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
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Folder Name *</label>
                        <input
                            type="text"
                            required
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-white/20"
                            placeholder="e.g. Rakib, Tanvir, Project Alpha..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-white/40 uppercase tracking-widest flex items-center gap-1.5">
                            <Palette size={12} />
                            Color
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setColor(c)}
                                    className="w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center"
                                    style={{
                                        backgroundColor: c + '20',
                                        border: color === c ? `2px solid ${c}` : '2px solid transparent',
                                        boxShadow: color === c ? `0 0 12px ${c}40` : 'none',
                                    }}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: c }}
                                    />
                                </button>
                            ))}
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
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-blue-500/25 transition-all text-sm active:scale-[0.98]"
                        >
                            📁 Create Folder
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
}
