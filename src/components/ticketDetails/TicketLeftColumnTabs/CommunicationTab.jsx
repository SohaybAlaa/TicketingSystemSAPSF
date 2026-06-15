import { useTranslation } from "react-i18next";
import { Send, User, UserCog, Calendar } from "lucide-react";
import EmptyState from "@components/ui/EmptyState";
import { formatDateTime } from "@utils/formatDateTime";

export default function CommunicationTab({
  comments,
  newComment,
  setNewComment,
  handleSendComment,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.comment_id}
          className={`group p-5 rounded-xl border-2 hover-effect ${
            comment.author_type === "HR"
              ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:border-yellow-300"
              : "bg-gradient-to-br from-blue-50 to-white border-blue-200 hover:border-blue-300"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                  comment.author_type === "HR"
                    ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                    : "bg-gradient-to-br from-blue-500 to-blue-600"
                }`}
              >
                {comment.author_type === "HR" ? (
                  <UserCog className="w-5 h-5 text-white" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <p className="!text-sm !font-semibold !text-gray-900">
                  {comment.author_name}
                </p>
                <p
                  className={`!text-xs !font-medium ${
                    comment.author_type === "HR"
                      ? "!text-yellow-600"
                      : "!text-blue-600"
                  }`}
                >
                  {comment.author_type}
                  {comment.department && ` • ${comment.department}`}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 !bg-gray-100 !text-xs !text-gray-700 !font-bold !px-3 !py-1.5 !rounded-lg">
              <Calendar className="w-3 h-3" />
              {formatDateTime(comment.created_at)}
            </span>
          </div>
          <p className="!text-sm !text-gray-800 !leading-relaxed">
            {comment.text}
          </p>
        </div>
      ))}

      {comments.length === 0 && (
        <EmptyState
          icon={Send}
          title={t("ticketDetails.communication.noComments")}
          description={t("ticketDetails.communication.startConversation")}
          className="py-12"
        />
      )}

      {/* Add Comment */}
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          {t("ticketDetails.communication.addResponse")}
        </label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={t("ticketDetails.communication.placeholder")}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 resize-none"
        />
        <button
          onClick={handleSendComment}
          className="mt-3 px-6 py-3 yellow-button"
        >
          <Send className="w-4 h-4" />
          {t("ticketDetails.communication.sendResponse")}
        </button>
      </div>
    </div>
  );
}
