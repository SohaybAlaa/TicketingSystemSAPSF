import { useTranslation } from "react-i18next";
import { Plus, User } from "lucide-react";
import { formatDateTime } from "@utils/formatDateTime";

export default function InternalNotesTab({
  internalNotes,
  newNote,
  setNewNote,
  handleAddNote,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {internalNotes.map((note) => (
        <div
          key={note.note_id}
          className="group p-5 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl hover:border-yellow-300 hover-effect"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-md">
                <User className="w-4 h-4 text-white" />
              </div>
              <p className="!text-sm !font-semibold !text-gray-900">
                {note.author_name}
              </p>
            </div>
            <span className="!bg-gray-100 text-gray-600 font-semibold !px-2 !py-1 !rounded-full">
              {formatDateTime(note.created_at)}
            </span>
          </div>
          <p className="!text-sm !text-gray-800 !leading-relaxed">{note.text}</p>
        </div>
      ))}

      {internalNotes.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-yellow-600" />
          </div>
          <p>
            {t("ticketDetails.internalNotes.noNotes")}
          </p>
          <p className="!text-sm !text-gray-400 mt-1">
            {t("ticketDetails.internalNotes.addPrivateNotes")}
          </p>
        </div>
      )}

      {/* Add Note */}
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {t("ticketDetails.internalNotes.addInternalNote")}
        </label>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder={t("ticketDetails.internalNotes.placeholder")}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 resize-none"
        />
        <button
          onClick={handleAddNote}
          className="mt-3 px-6 py-3 yellow-button"
        >
          <Plus className="w-4 h-4" />
          {t("ticketDetails.internalNotes.addNote")}
        </button>
      </div>
    </div>
  );
}
