import { Bot } from 'lucide-react';
export default function Error404() {
  return (
    <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        {/* 404 Number */}
        <div className="relative mb-8">
          <h1 className="text-9xl font-bold text-yellow-400 opacity-20 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-gray-800 px-6 py-2 rounded-lg border-2 border-yellow-500">
              <p className="text-2xl font-semibold text-white">Page Not Found</p>
            </div>
          </div>
        </div>

         {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-32 h-32 bg-yellow-500 rounded-full flex items-center justify-center">
            <Bot className="w-16 h-16 text-gray-800" />
          </div>
        </div>

        {/* Message */}
        <p className="text-xl text-yellow-400 mb-2 font-medium">
          Oops! We couldn't find that page.
        </p>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          The page you're looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-yellow-500 text-gray-800 font-semibold rounded-lg hover:bg-yellow-400 transition-colors duration-200"
          >
            Go Back
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="px-6 py-3 bg-transparent text-yellow-400 font-semibold rounded-lg border-2 border-yellow-400 hover:bg-yellow-400 hover:text-gray-800 transition-colors duration-200"
          >
            Go Home
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
}