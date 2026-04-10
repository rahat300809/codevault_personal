import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Trash2, Edit2, Copy, Check, Calendar, Tag, MoreVertical, Download, Maximize2, X } from 'lucide-react';
import { Snippet } from '../types';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SnippetCardProps {
  snippet: Snippet;
  onDelete: (id: string) => void | Promise<void>;
  onEdit: (snippet: Snippet) => void;
}

// Generate PDF from code
function downloadAsPdf(snippet: Snippet) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${snippet.title} — CodeVault</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Inter:wght@400;600;700&display=swap');
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Inter',sans-serif; background:#fff; color:#1a1a1a; padding:40px; }
    .header { border-bottom:2px solid #10b981; padding-bottom:16px; margin-bottom:24px; }
    .header h1 { font-size:22px; font-weight:700; color:#0d0e10; margin-bottom:4px; }
    .header .meta { font-size:12px; color:#666; display:flex; gap:16px; align-items:center; }
    .header .lang { background:#10b981; color:white; padding:2px 8px; border-radius:4px; font-weight:600; text-transform:uppercase; font-size:10px; letter-spacing:1px; }
    .desc { font-size:13px; color:#555; margin-bottom:20px; line-height:1.6; font-style:italic; }
    .code-block { background:#1e1e1e; color:#d4d4d4; padding:20px; border-radius:8px; font-family:'JetBrains Mono',monospace; font-size:12px; line-height:1.7; white-space:pre-wrap; word-wrap:break-word; overflow-wrap:break-word; }
    .tags { margin-top:20px; display:flex; gap:6px; flex-wrap:wrap; }
    .tag { background:#f0fdf4; color:#10b981; padding:3px 10px; border-radius:4px; font-size:10px; font-weight:600; border:1px solid #d1fae5; }
    .footer { margin-top:30px; padding-top:16px; border-top:1px solid #eee; font-size:10px; color:#999; text-align:center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${snippet.title}</h1>
    <div class="meta">
      <span class="lang">${snippet.language}</span>
      <span>Created: ${new Date(snippet.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
    </div>
  </div>
  ${snippet.description ? `<div class="desc">${snippet.description}</div>` : ''}
  <div class="code-block">${snippet.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  ${snippet.tags.length ? `<div class="tags">${snippet.tags.map(t => `<span class="tag">#${t}</span>`).join('')}</div>` : ''}
  <div class="footer">Exported from CodeVault — snippet300809.web.app — © 2026 Rahat Mahamud</div>
  <script>
    window.onload = function() { window.print(); };
  </script>
</body>
</html>`);
  printWindow.document.close();
}

// Full code viewer modal
function FullCodeModal({ snippet, onClose }: { snippet: Snippet; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copyAll = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ type: "spring", duration: 0.4 }}
        onClick={e => e.stopPropagation()}
        className="glass-card rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-white truncate">{snippet.title}</h3>
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shrink-0">
              {snippet.language}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={copyAll}
              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all text-sm flex items-center gap-1.5"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              <span className="hidden sm:inline text-xs">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button
              onClick={() => downloadAsPdf(snippet)}
              className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all text-sm flex items-center gap-1.5"
            >
              <Download size={16} />
              <span className="hidden sm:inline text-xs">PDF</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Code */}
        <div className="flex-1 overflow-auto scrollbar-thin">
          <SyntaxHighlighter
            language={snippet.language}
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{
              margin: 0,
              padding: '1.5rem',
              fontSize: '0.8rem',
              lineHeight: '1.7',
              background: 'transparent',
              minHeight: '100%',
            }}
          >
            {snippet.code}
          </SyntaxHighlighter>
        </div>

        {/* Footer */}
        {snippet.description && (
          <div className="p-4 border-t border-white/5 shrink-0">
            <p className="text-xs text-white/40 leading-relaxed">{snippet.description}</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export function SnippetCard({ snippet, onDelete, onEdit }: SnippetCardProps) {
  const [copied, setCopied] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showFullCode, setShowFullCode] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setShowActions(false);
      }
    };
    if (showActions) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showActions]);

  const langColors: Record<string, string> = {
    c: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    javascript: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
    typescript: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    python: 'bg-green-400/10 text-green-400 border-green-400/20',
    java: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    cpp: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
    csharp: 'bg-violet-400/10 text-violet-400 border-violet-400/20',
    html: 'bg-red-400/10 text-red-400 border-red-400/20',
    css: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/20',
    sql: 'bg-pink-400/10 text-pink-400 border-pink-400/20',
    go: 'bg-sky-400/10 text-sky-400 border-sky-400/20',
    rust: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
    php: 'bg-indigo-400/10 text-indigo-400 border-indigo-400/20',
  };
  const langColor = langColors[snippet.language] || 'bg-white/10 text-white/60 border-white/10';

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="glass-card glow-ring rounded-2xl overflow-hidden group transition-all duration-500"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
          <div className="flex flex-col gap-2 min-w-0 flex-1">
            <h3 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors duration-300 truncate">
              {snippet.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-widest ${langColor}`}>
                {snippet.language}
              </span>
              <span className="flex items-center gap-1 text-white/30 text-[11px]">
                <Calendar size={10} />
                {formatDate(snippet.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div ref={actionsRef} className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 hover:bg-white/10 rounded-xl text-white/30 hover:text-white transition-all"
            >
              <MoreVertical size={16} />
            </button>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-full mt-1 w-44 py-1 rounded-xl glass-card border border-white/10 shadow-2xl z-20"
              >
                <button
                  onClick={() => { setShowFullCode(true); setShowActions(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Maximize2 size={14} />
                  View Full Code
                </button>
                <button
                  onClick={() => { downloadAsPdf(snippet); setShowActions(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Download size={14} />
                  Download PDF
                </button>
                <button
                  onClick={() => { onEdit(snippet); setShowActions(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Edit2 size={14} />
                  Edit
                </button>
                <div className="my-1 border-t border-white/5" />
                <button
                  onClick={() => { onDelete(snippet.id); setShowActions(false); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/5 transition-all"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Code block — clickable to view full */}
        <div
          className="relative group/code mx-3 cursor-pointer"
          onClick={() => setShowFullCode(true)}
        >
          <div className="absolute right-3 top-3 z-10 flex gap-1.5">
            <button
              onClick={(e) => { e.stopPropagation(); copyToClipboard(); }}
              className="p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-white/40 hover:text-white hover:bg-black/70 transition-all"
              title="Copy code"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setShowFullCode(true); }}
              className="p-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-white/40 hover:text-white hover:bg-black/70 transition-all"
              title="View full code"
            >
              <Maximize2 size={14} />
            </button>
          </div>
          <div className="max-h-[200px] overflow-hidden rounded-xl bg-[#0a0b0d] border border-white/[0.04] relative">
            <SyntaxHighlighter
              language={snippet.language}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: '1.25rem',
                fontSize: '0.8rem',
                lineHeight: '1.6',
                background: 'transparent',
              }}
            >
              {snippet.code}
            </SyntaxHighlighter>
            {/* Fade overlay to hint more code */}
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0b0d] to-transparent pointer-events-none" />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 pt-3 sm:pt-4">
          {snippet.description && (
            <p className="text-xs text-white/40 mb-3 line-clamp-2 leading-relaxed">
              {snippet.description}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {snippet.tags.map(tag => (
              <span key={tag} className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400/70 bg-emerald-400/5 px-2 py-1 rounded-md border border-emerald-400/10">
                <Tag size={9} />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Full Code Modal */}
      <AnimatePresence>
        {showFullCode && (
          <FullCodeModal snippet={snippet} onClose={() => setShowFullCode(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
