import { useTranslation } from "react-i18next";
import { Plus, UserCog, Calendar } from "lucide-react";
import { formatDateTime } from "@utils/formatDateTime";

const noteColors = [
  { bg: 'from-yellow-50 to-amber-50', border: 'border-yellow-200 hover:border-yellow-300', avatar: 'from-yellow-400 to-yellow-500', dept: '!text-yellow-600' },
  { bg: 'from-blue-50 to-indigo-50', border: 'border-blue-200 hover:border-blue-300', avatar: 'from-blue-400 to-blue-500', dept: '!text-blue-600' },
  { bg: 'from-emerald-50 to-green-50', border: 'border-emerald-200 hover:border-emerald-300', avatar: 'from-emerald-400 to-emerald-500', dept: '!text-emerald-600' },
  { bg: 'from-purple-50 to-violet-50', border: 'border-purple-200 hover:border-purple-300', avatar: 'from-purple-400 to-purple-500', dept: '!text-purple-600' },
  { bg: 'from-rose-50 to-pink-50', border: 'border-rose-200 hover:border-rose-300', avatar: 'from-rose-400 to-rose-500', dept: '!text-rose-600' },
];

export default function InternalNotesTab({
  internalNotes,
  newNote,
  setNewNote,
  handleAddNote,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {internalNotes.map((note, index) => {
        const color = noteColors[index % noteColors.length];
        return (
        <div
          key={note.note_id}
          className={`group p-5 bg-gradient-to-br ${color.bg} border-2 ${color.border} rounded-xl hover-effect`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-gradient-to-br ${color.avatar} rounded-full flex items-center justify-center shadow-md`}>
                <UserCog className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="!text-sm !font-semibold !text-gray-900">
                  {note.author_name}
                </p>
                {note.department && (
                  <p className={`!text-xs !font-medium ${color.dept}`}>
                    {note.department}
                  </p>
                )}
              </div>
            </div>
            <span className="flex items-center gap-1.5 !bg-gray-100 !text-xs !text-gray-700 !font-bold !px-3 !py-1.5 !rounded-lg">
              <Calendar className="w-3 h-3" />
              {formatDateTime(note.created_at)}
            </span>
          </div>
          <p className="!text-sm !text-gray-800 !leading-relaxed">{note.text}</p>
        </div>
        );
      })}

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
