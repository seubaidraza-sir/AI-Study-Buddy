import React, { useState } from 'react';
import { ArrowLeft, Search, Plus, Trash2, Star, Edit, FileText, ChevronRight, Save, Sparkles } from 'lucide-react';
import { Note, UserProfile } from '../types';

interface NotesManagerProps {
  profile: UserProfile;
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'date'>) => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onTriggerSummarize: (text: string) => void;
  onGoBack: () => void;
}

export default function NotesManager({
  profile,
  notes,
  onAddNote,
  onEditNote,
  onDeleteNote,
  onTriggerSummarize,
  onGoBack
}: NotesManagerProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');

  const categories = ['All', 'Summaries', 'Scanned', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'General'];

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSave = () => {
    if (!title.trim() || !content.trim()) return;

    if (editingNote) {
      onEditNote({
        ...editingNote,
        title,
        content,
        category
      });
      setEditingNote(null);
    } else {
      onAddNote({
        title,
        content,
        category,
        isFavorite: false
      });
    }

    // Reset Form
    setTitle('');
    setContent('');
    setCategory('General');
    setIsCreating(false);
  };

  const handleStartEdit = (n: Note) => {
    setEditingNote(n);
    setTitle(n.title);
    setContent(n.content);
    setCategory(n.category);
    setIsCreating(true);
  };

  const toggleFavorite = (n: Note) => {
    onEditNote({
      ...n,
      isFavorite: !n.isFavorite
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 font-sans">
      {/* Top Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <button onClick={onGoBack} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-600 dark:text-slate-300">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="text-center flex-1">
          <h2 className="text-xs font-bold font-display text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Notes Management
          </h2>
          <p className="text-[9px] text-slate-400">Organize and search class work</p>
        </div>
        {!isCreating ? (
          <button 
            onClick={() => {
              setEditingNote(null);
              setTitle('');
              setContent('');
              setCategory('General');
              setIsCreating(true);
            }} 
            className="p-1.5 bg-purple-600 text-white rounded-full transition hover:bg-purple-700"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Editor Overlay Panel */}
      {isCreating ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800 pb-2">
            <span>{editingNote ? 'EDIT NOTE' : 'CREATE NOTE'}</span>
            <button onClick={() => setIsCreating(false)} className="text-rose-500 font-mono">Cancel</button>
          </div>

          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Lecture notes topic name..."
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none text-slate-800 dark:text-slate-100"
              >
                {categories.slice(1).map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Content Text</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Draft note materials, paste text transcripts, equations..."
                className="w-full h-44 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* AI Shortcut within draft */}
            {content.length > 30 && (
              <button
                type="button"
                onClick={() => onTriggerSummarize(content)}
                className="w-full py-1.5 px-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/30 text-[10px] text-purple-700 dark:text-purple-300 font-semibold rounded-lg flex items-center justify-center space-x-1 hover:bg-purple-100"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Summarize Draft with AI</span>
              </button>
            )}

            <button
              onClick={handleSave}
              disabled={!title.trim() || !content.trim()}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
            >
              <Save className="h-4 w-4" />
              <span>Save Note Entry</span>
            </button>
          </div>
        </div>
      ) : (
        /* Notes Browser Display */
        <div className="flex-1 flex flex-col overflow-hidden font-sans">
          {/* Search Bar */}
          <div className="p-3 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 flex items-center space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search note titles or content..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 rounded-lg focus:outline-none border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* Categories tag ribbon */}
          <div className="flex bg-slate-100 dark:bg-slate-900/60 py-2 px-3 space-x-1.5 overflow-x-auto border-b border-slate-200 dark:border-slate-900/60 text-[10px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* List display */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <div 
                  key={note.id} 
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-3 shadow-sm hover:border-purple-300 transition group"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5 max-w-[70%]">
                      <span className="text-[8px] font-bold tracking-wide uppercase px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/20 border border-purple-100/40 dark:border-purple-900/10 text-purple-600 dark:text-purple-400">
                        {note.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-purple-600 transition">
                        {note.title}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button onClick={() => toggleFavorite(note)} className="text-slate-300 hover:text-amber-500 transition">
                        <Star className={`h-4 w-4 ${note.isFavorite ? 'text-amber-500 fill-current' : ''}`} />
                      </button>
                      <button onClick={() => handleStartEdit(note)} className="text-slate-400 hover:text-blue-500 transition">
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => onDeleteNote(note.id)} className="text-slate-400 hover:text-rose-500 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>

                  <div className="flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span>{note.date}</span>
                    <button
                      onClick={() => onTriggerSummarize(note.content)}
                      className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center space-x-0.5"
                    >
                      <span>Analyze AI</span>
                      <ChevronRight className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 italic">
                No matching study notes found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
