import { Plus, User } from "lucide-react";
import { formatDateTime } from "../../../utils/formatDateTime";

export default function InternalNotesTab({
  internalNotes,
  newNote,
  setNewNote,
  handleAddNote,
}) {
  return (
    <div className="space-y-4">
      {internalNotes.map((note) => (
        <div
          key={note.note_id}
          className="group p-5 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl hover:border-yellow-300 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {note.author_name}
              </p>
            </div>
            <span className="text-xs text-gray-500 bg-white/70 px-2 py-1 rounded-full">
              {formatDateTime(note.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">{note.text}</p>
        </div>
      ))}

      {internalNotes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-yellow-600" />
          </div>
          <p className="text-gray-500 font-medium">No internal notes</p>
          <p className="text-sm text-gray-400 mt-1">
            Add private notes for HR team only
          </p>
        </div>
      )}

      {/* Add Note */}
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Add Internal Note
        </label>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note visible only to HR team..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
        />
        <button
          onClick={handleAddNote}
          className="mt-3 px-6 py-3 cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-700 font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </button>
      </div>
    </div>
  );
}
