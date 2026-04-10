import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Code2, LayoutGrid, Terminal, Filter, ChevronRight,
  Menu, X, Zap, Layers, Clock, Hash, ExternalLink, Cloud,
  FolderPlus, Folder as FolderIcon, Trash2, Linkedin, Facebook,
  MessageCircle, Mail, MapPin
} from 'lucide-react';
import { Snippet, NewSnippet, Folder } from './types';
import { snippetService, folderService } from './lib/snippetService';
import { SnippetCard } from './components/SnippetCard';
import { SnippetForm } from './components/SnippetForm';
import { FolderDialog } from './components/FolderDialog';
import { useToast } from './components/Toast';
import { ConfirmDialog, useConfirmDialog } from './components/ConfirmDialog';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';

export default function App() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFolderFormOpen, setIsFolderFormOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { addToast } = useToast();
  const { confirm, dialogProps } = useConfirmDialog();

  useEffect(() => {
    const unsubscribe = folderService.subscribeToFolders(
      (data) => setFolders(data),
      (err) => console.error("Folder subscription error:", err)
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = snippetService.subscribeToSnippets(
      (data) => { setSnippets(data); setLoading(false); setError(null); },
      (err) => { console.error("Firebase error:", err); setError("Unable to connect to Firebase."); setLoading(false); }
    );
    return () => unsubscribe();
  }, []);

  const handleAddSnippet = async (newSnippet: NewSnippet) => {
    try {
      if (editingSnippet) {
        await snippetService.updateSnippet(editingSnippet.id, newSnippet);
        addToast('success', 'Snippet Updated', `"${newSnippet.title}" saved.`);
        setEditingSnippet(null);
      } else {
        await snippetService.addSnippet(newSnippet);
        addToast('success', 'Snippet Created', `"${newSnippet.title}" added.`);
      }
    } catch { addToast('error', 'Save Failed', 'Could not save snippet.'); }
  };

  const handleDeleteSnippet = async (id: string) => {
    const snippet = snippets.find((s: Snippet) => s.id === id);
    const confirmed = await confirm('Delete Snippet', `Delete "${snippet?.title}"? This cannot be undone.`);
    if (confirmed) {
      try { await snippetService.deleteSnippet(id); addToast('success', 'Deleted', 'Snippet removed.'); }
      catch { addToast('error', 'Failed', 'Could not delete.'); }
    }
  };

  const handleAddFolder = async (folder: { name: string; color: string }) => {
    try { await folderService.addFolder(folder); addToast('success', 'Folder Created', `"${folder.name}" ready.`); }
    catch { addToast('error', 'Failed', 'Could not create folder.'); }
  };

  const handleDeleteFolder = async (id: string) => {
    const folder = folders.find((f: Folder) => f.id === id);
    const confirmed = await confirm('Delete Folder', `Delete "${folder?.name}"? Snippets won't be deleted.`);
    if (confirmed) {
      try {
        await folderService.deleteFolder(id);
        if (selectedFolderId === id) setSelectedFolderId(null);
        addToast('success', 'Deleted', `"${folder?.name}" removed.`);
      } catch { addToast('error', 'Failed', 'Could not delete folder.'); }
    }
  };

  const filteredSnippets = useMemo(() => {
    return snippets.filter((s: Snippet) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || s.tags.some((t: string) => t.toLowerCase().includes(q));
      const matchesLanguage = selectedLanguage === 'All' || s.language === selectedLanguage;
      const matchesFolder = !selectedFolderId || s.folderId === selectedFolderId;
      return matchesSearch && matchesLanguage && matchesFolder;
    });
  }, [snippets, searchQuery, selectedLanguage, selectedFolderId]);

  const languages = useMemo(() => ['All', ...new Set(snippets.map((s: Snippet) => s.language))], [snippets]);
  const stats = useMemo(() => ({
    total: snippets.length,
    languages: new Set(snippets.map((s: Snippet) => s.language)).size,
    tags: new Set(snippets.flatMap((s: Snippet) => s.tags)).size,
    recent: snippets.filter((s: Snippet) => Date.now() - s.createdAt < 7 * 24 * 60 * 60 * 1000).length,
  }), [snippets]);

  const statCards = [
    { icon: Layers, label: 'Total Snippets', value: stats.total, color: 'from-emerald-500 to-teal-600' },
    { icon: Hash, label: 'Languages', value: stats.languages, color: 'from-blue-500 to-indigo-600' },
    { icon: Zap, label: 'Unique Tags', value: stats.tags, color: 'from-purple-500 to-pink-600' },
    { icon: Clock, label: 'This Week', value: stats.recent, color: 'from-amber-500 to-orange-600' },
  ];

  const currentFolder = folders.find((f: Folder) => f.id === selectedFolderId);

  const sidebarContent = (
    <>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="px-4 py-2 text-[10px] font-bold text-white/25 uppercase tracking-[0.15em]">Main Menu</div>
        <button
          onClick={() => { setSelectedFolderId(null); setMobileMenuOpen(false); }}
          className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all", !selectedFolderId ? "bg-emerald-500/10 text-emerald-400" : "text-white/35 hover:text-white hover:bg-white/5")}
        >
          <LayoutGrid size={18} /> All Snippets
        </button>

        <div className="pt-6 px-4 py-2 text-[10px] font-bold text-white/25 uppercase tracking-[0.15em] flex items-center justify-between">
          <span>Folders</span>
          <button onClick={() => setIsFolderFormOpen(true)} className="p-1 hover:bg-white/10 rounded-lg text-white/30 hover:text-emerald-400 transition-all" title="Create folder"><FolderPlus size={14} /></button>
        </div>
        {folders.length === 0 && <div className="px-4 py-3 text-[11px] text-white/20 italic">No folders yet. Create one!</div>}
        {folders.map((folder: Folder) => (
          <div key={folder.id} className="group flex items-center">
            <button
              onClick={() => { setSelectedFolderId(folder.id); setMobileMenuOpen(false); }}
              className={cn("flex-1 flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all", selectedFolderId === folder.id ? "font-medium" : "text-white/35 hover:text-white hover:bg-white/5")}
              style={selectedFolderId === folder.id ? { color: folder.color, backgroundColor: folder.color + '12' } : {}}
            >
              <FolderIcon size={16} style={{ color: selectedFolderId === folder.id ? folder.color : undefined }} />
              <span className="truncate">{folder.name}</span>
              {selectedFolderId === folder.id && <ChevronRight size={14} className="ml-auto shrink-0" />}
            </button>
            <button onClick={() => handleDeleteFolder(folder.id)} className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-lg text-white/20 hover:text-red-400 transition-all mr-1" title="Delete folder"><Trash2 size={12} /></button>
          </div>
        ))}

        <div className="pt-6 px-4 py-2 text-[10px] font-bold text-white/25 uppercase tracking-[0.15em]">Languages</div>
        {languages.map((lang: string) => (
          <button key={lang} onClick={() => { setSelectedLanguage(lang); setMobileMenuOpen(false); }}
            className={cn("w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all", selectedLanguage === lang ? "text-emerald-400 bg-emerald-400/10 font-medium" : "text-white/35 hover:text-white hover:bg-white/5")}>
            <span className="capitalize">{lang}</span>
            {selectedLanguage === lang && <ChevronRight size={14} />}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="glass-card rounded-2xl p-3">
          <div className="flex items-center gap-2 mb-2"><Cloud size={13} className="text-emerald-400" /><span className="text-[10px] font-semibold text-white/40">Sync Status</span></div>
          <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /><span className="text-[11px] text-white/50">Connected</span></div>
          <a href="https://snippet300809.web.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400/60 hover:text-emerald-400 transition-colors"><ExternalLink size={10} />snippet300809.web.app</a>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen text-white font-sans">
      <div className="gradient-bg" />
      <div className="noise-overlay" />

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0c0d0f]/90 backdrop-blur-2xl border-r border-white/[0.04] hidden lg:flex flex-col z-30">
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 pulse-glow"><Terminal size={22} className="text-white" /></div>
          <div><span className="text-lg font-bold tracking-tight">CodeVault</span><div className="text-[10px] text-white/25 font-medium tracking-widest uppercase">Snippet Manager</div></div>
        </div>
        {sidebarContent}
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0c0d0f]/90 backdrop-blur-2xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"><Terminal size={18} className="text-white" /></div>
            <span className="text-lg font-bold tracking-tight">CodeVault</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile slideout */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#0c0d0f] border-r border-white/5 z-50 lg:hidden flex flex-col">
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center"><Terminal size={22} className="text-white" /></div>
                  <span className="text-lg font-bold tracking-tight">CodeVault</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-xl text-white/50"><X size={20} /></button>
              </div>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-[260px] p-4 lg:p-8 pt-20 lg:pt-8 relative z-10">
        <header className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <motion.h1 key={selectedFolderId || 'all'} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
                {currentFolder ? (<span className="flex items-center gap-3"><FolderIcon size={32} style={{ color: currentFolder.color }} />{currentFolder.name}</span>) : 'My Snippets'}
              </motion.h1>
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-white/30 text-sm">
                {error ? <span className="text-amber-400/80">⚠ {error}</span> : currentFolder ? <span>{filteredSnippets.length} snippet{filteredSnippets.length !== 1 ? 's' : ''} in this folder</span> : <>Syncing to <span className="text-emerald-400/60 font-mono text-xs">snippet300809.web.app</span></>}
              </motion.p>
            </div>
            <div className="flex gap-2">
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                onClick={() => setIsFolderFormOpen(true)}
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-3 rounded-2xl font-medium transition-all text-sm">
                <FolderPlus size={18} /><span className="hidden sm:inline">New Folder</span>
              </motion.button>
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                onClick={() => setIsFormOpen(true)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-xl shadow-emerald-500/20 transition-all active:scale-95 text-sm">
                <Plus size={18} strokeWidth={2.5} /> New Snippet
              </motion.button>
            </div>
          </div>

          {!loading && snippets.length > 0 && !selectedFolderId && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              {statCards.map((stat, i) => (
                <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
                  className="glass-card rounded-2xl p-4 group hover:border-white/10 transition-all">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon size={16} className="text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                  <div className="text-[11px] text-white/30 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          )}
        </header>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/15" size={18} />
            <input type="text" placeholder="Search snippets, code, tags..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/10 transition-all placeholder:text-white/20 backdrop-blur-sm" />
          </div>
          <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-2 backdrop-blur-sm">
            <Filter size={16} className="text-white/15" />
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-white/50 text-sm focus:outline-none capitalize cursor-pointer">
              {languages.map((lang: string) => <option key={lang} value={lang} className="bg-[#0c0d0f]">{lang}</option>)}
            </select>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <div className="p-5 space-y-3"><div className="skeleton h-5 w-3/4" /><div className="skeleton h-3 w-1/2" /></div>
                <div className="mx-3 h-40 skeleton rounded-xl" />
                <div className="p-5 space-y-2"><div className="skeleton h-3 w-full" /><div className="flex gap-2"><div className="skeleton h-5 w-16" /><div className="skeleton h-5 w-12" /></div></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filteredSnippets.map((snippet: Snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} onDelete={handleDeleteSnippet} onEdit={(s: Snippet) => { setEditingSnippet(s); setIsFormOpen(true); }} />
              ))}
            </AnimatePresence>
            {filteredSnippets.length === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/10 mb-6 animate-float"><Code2 size={48} strokeWidth={1} /></div>
                <h3 className="text-xl font-bold text-white/50 mb-2">{searchQuery ? "No matching snippets" : currentFolder ? `"${currentFolder.name}" is empty` : "Your vault is empty"}</h3>
                <p className="text-sm text-white/25 max-w-xs mb-6">{searchQuery ? "Try adjusting your search or clearing filters." : "Start by adding your first code snippet!"}</p>
                {!searchQuery && (
                  <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-5 py-2.5 rounded-xl text-sm font-medium transition-all border border-emerald-500/20"><Plus size={16} />Add Your First Snippet</button>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Developer Footer */}
        <footer className="mt-20 mb-8 border-t border-white/[0.04] pt-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/10">
                <img src="/developer.jpg" alt="Rahat Mahamud" className="w-full h-full object-cover object-top" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Rahat Mahamud</h3>
            <p className="text-xs text-white/40 mb-3">B.Sc in CSE | Daffodil International University</p>
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5 max-w-lg mx-auto">
              {['C', 'C++', 'Python', 'Arduino', 'Embedded Systems', 'IoT', 'Cyber Security', 'Web Developer', 'Vibe Coding', 'Research Paper Writing'].map(skill => (
                <span key={skill} className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-white/[0.03] border border-white/[0.06] text-white/30">{skill}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 mb-5 text-xs text-white/30">
              <a href="mailto:rahat3008096081@gmail.com" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors"><Mail size={13} />rahat3008096081@gmail.com</a>
              <span className="flex items-center gap-1.5"><MapPin size={13} />Bangladesh</span>
            </div>
            <div className="flex items-center justify-center gap-3 mb-6">
              <a href="https://www.linkedin.com/in/rahat300809/" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-[#0A66C2] hover:border-[#0A66C2]/30 hover:bg-[#0A66C2]/10 transition-all" title="LinkedIn"><Linkedin size={18} /></a>
              <a href="https://www.facebook.com/rahat300809" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-[#1877F2] hover:border-[#1877F2]/30 hover:bg-[#1877F2]/10 transition-all" title="Facebook"><Facebook size={18} /></a>
              <a href="https://wa.me/8801909566539" target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-[#25D366] hover:border-[#25D366]/30 hover:bg-[#25D366]/10 transition-all" title="WhatsApp"><MessageCircle size={18} /></a>
            </div>
            <p className="text-[11px] text-white/15">© 2026 Rahat Mahamud. All rights reserved.</p>
          </div>
        </footer>
      </main>

      <AnimatePresence>
        {isFormOpen && (
          <SnippetForm onSubmit={handleAddSnippet} onClose={() => { setIsFormOpen(false); setEditingSnippet(null); }} initialData={editingSnippet || undefined} folders={folders} currentFolderId={selectedFolderId} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isFolderFormOpen && (
          <FolderDialog onSubmit={handleAddFolder} onClose={() => setIsFolderFormOpen(false)} />
        )}
      </AnimatePresence>
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
