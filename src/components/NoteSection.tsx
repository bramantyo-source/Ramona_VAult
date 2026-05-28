import React, { useState } from "react";
import { Search, Plus, Calendar, Trash2, Edit2, Tag, Copy, Check, FileText } from "lucide-react";
import { NoteItem } from "../types";

interface NoteSectionProps {
  notes: NoteItem[];
  onSaveNotes: (updatedNotes: NoteItem[]) => void;
}

export default function NoteSection({ notes, onSaveNotes }: NoteSectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Edit states
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editTagText, setEditTagText] = useState("");

  const handleAddNew = () => {
    const newNote: NoteItem = {
      id: "note_" + Date.now().toString(),
      title: "Catatan Rahasia Baru",
      content: "Tulis detail catatan sensitif Anda di sini...",
      tags: ["Umum"],
      updatedAt: new Date().toISOString()
    };
    const updated = [newNote, ...notes];
    onSaveNotes(updated);
    setSelectedNote(newNote);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
    setEditTagText(newNote.tags.join(", "));
    setIsEditing(true);
  };

  const handleSelectNote = (note: NoteItem) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setEditTagText(note.tags.join(", "));
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!selectedNote) return;

    const parsedTags = editTagText
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const updatedNotes = notes.map(n => {
      if (n.id === selectedNote.id) {
        return {
          ...n,
          title: editTitle || "Tanpa Judul",
          content: editContent,
          tags: parsedTags.length > 0 ? parsedTags : ["Umum"],
          updatedAt: new Date().toISOString()
        };
      }
      return n;
    });

    onSaveNotes(updatedNotes);
    setIsEditing(false);
    
    // Update local selected note state
    setSelectedNote({
      ...selectedNote,
      title: editTitle || "Tanpa Judul",
      content: editContent,
      tags: parsedTags.length > 0 ? parsedTags : ["Umum"],
      updatedAt: new Date().toISOString()
    });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const filtered = notes.filter(n => n.id !== id);
    onSaveNotes(filtered);
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = notes.filter(note => {
    const text = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(text) ||
      note.content.toLowerCase().includes(text) ||
      note.tags.some(tag => tag.toLowerCase().includes(text))
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="note-section">
      
      {/* Sidebar List ( col-span-4 ) */}
      <div className="md:col-span-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              id="input-note-search"
              placeholder="Cari catatan rahasia..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs text-slate-900 outline-none focus:border-indigo-300/50"
            />
          </div>
          <button
            type="button"
            id="btn-note-add"
            onClick={handleAddNew}
            className="p-2 border border-slate-300 bg-white hover:bg-white text-indigo-600 rounded-lg"
            title="Catatan Baru"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
              Tidak ada catatan rahasia ditemukan.
            </div>
          ) : (
            filtered.map(note => (
              <div
                key={note.id}
                onClick={() => handleSelectNote(note)}
                className={`p-3.5 rounded-xl border transition cursor-pointer text-left relative group ${
                  selectedNote?.id === note.id
                    ? "bg-indigo-50 border-indigo-300/40"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="space-y-1.5 pr-6">
                  <h4 className="font-semibold text-xs text-slate-800 truncate">{note.title}</h4>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {note.content}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="text-xs font-mono py-0.5 px-1.5 bg-white text-slate-700 rounded border border-slate-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="absolute top-3.5 right-3 flex items-center gap-1.5 opacity-100 transition duration-155">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(note.id, e)}
                    className="p-1 text-slate-500 hover:text-rose-600 hover:bg-white rounded cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Editor / Viewer Workspace ( col-span-8 ) */}
      <div className="md:col-span-8">
        {selectedNote ? (
          <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 space-y-4 min-h-[460px] flex flex-col">
            
            {/* Header controls */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-600">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-mono uppercase tracking-wider">
                  Diperbarui: {new Date(selectedNote.updatedAt).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopy(selectedNote.content, selectedNote.id)}
                  className="py-1 px-2 border border-slate-300 bg-slate-50 hover:bg-white text-slate-700 text-xs rounded-lg flex items-center gap-1"
                >
                  {copiedId === selectedNote.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{copiedId === selectedNote.id ? "Tersalin" : "Salin Isi"}</span>
                </button>
                
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="py-1 px-2.5 text-xs text-slate-600 hover:bg-white rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="py-1 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg shadow-md"
                    >
                      Simpan
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="py-1 px-3 border border-slate-300 bg-white hover:bg-white text-indigo-600 text-xs font-semibold rounded-lg flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit
                  </button>
                )}
              </div>
            </div>

            {/* Note Workspace Body */}
            {isEditing ? (
              <div className="space-y-3 flex-1 flex flex-col">
                <input
                  type="text"
                  placeholder="Judul Catatan..."
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-sm font-semibold rounded-lg p-2.5 outline-none focus:border-indigo-300/40"
                />
                
                <input
                  type="text"
                  placeholder="Label tags (pisahkan dengan koma: Tag1, Tag2, dll)..."
                  value={editTagText}
                  onChange={(e) => setEditTagText(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-700 text-xs rounded-lg p-2.5 outline-none focus:border-indigo-300/40 font-mono"
                />

                <textarea
                  placeholder="Mulai mengetik catatan end-to-end terenkripsi Anda di sini..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 text-xs rounded-lg p-2.5 outline-none focus:border-indigo-300/40 flex-1 min-h-[250px] resize-none font-sans leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-4 flex-1">
                <h3 className="text-lg font-bold text-slate-900 font-sans tracking-tight">{selectedNote.title}</h3>
                
                <div className="flex flex-wrap gap-1.5">
                  {selectedNote.tags.map((tag, idx) => (
                    <span key={idx} className="flex items-center gap-1 text-xs py-0.5 px-2 bg-white text-slate-700 rounded border border-slate-300">
                      <Tag className="w-2.5 h-2.5 text-indigo-600" />
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-slate-700 text-xs font-sans whitespace-pre-wrap leading-relaxed outline-none border border-transparent p-1 max-h-[340px] overflow-y-auto">
                  {selectedNote.content}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 border-dashed rounded-xl p-6 min-h-[460px] flex flex-col justify-center items-center text-center space-y-3">
            <div className="p-4 bg-white rounded-full border border-slate-300 text-slate-500">
              <FileText className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-700 font-bold text-sm">Tidak Ada Catatan Terpilih</h3>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                Pilih salah satu catatan dari daftar sebelah kiri atau buat baru untuk mulai melihat isinya yang terenkripsi luhur.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
