import { Send, User } from "lucide-react";
import { formatDateTime } from "../../../utils/formatDateTime";

export default function CommunicationTab({
  comments,
  newComment,
  setNewComment,
  handleSendComment,
}) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.comment_id}
          className={`group p-5 rounded-xl border-2 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ${
            comment.author_type === "HR"
              ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:border-yellow-300"
              : "bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                  comment.author_type === "HR"
                    ? "bg-gradient-to-br from-yellow-500 to-yellow-600"
                    : "bg-gradient-to-br from-gray-600 to-gray-700"
                }`}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {comment.author_name}
                </p>
                <p
                  className={`text-xs font-medium ${
                    comment.author_type === "HR"
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                >
                  {comment.author_type}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-full">
              {formatDateTime(comment.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-800 leading-relaxed">
            {comment.text}
          </p>
        </div>
      ))}

      {comments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No communication yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Start the conversation below
          </p>
        </div>
      )}

      {/* Add Comment */}
      <div className="mt-6 pt-6 border-t-2 border-gray-200">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Add Response to Employee
        </label>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Type your response here..."
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-200 resize-none"
        />
        <button
          onClick={handleSendComment}
          className="mt-3 px-6 py-3 cursor-pointer bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-semibold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-xl flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send Response
        </button>
      </div>
    </div>
  );
}
