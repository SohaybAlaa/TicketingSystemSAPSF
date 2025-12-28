import { Bot, ArrowLeft, Home, RefreshCw } from "lucide-react";

export default function Error404() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-28 -right-28 w-[28rem] h-[28rem] bg-red-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:22px_22px] opacity-30" />
      </div>

      <div className="relative w-full max-w-2xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-8 sm:p-12">
            {/* Top badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 text-white/80 text-sm">
                <span className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.35)]" />
                Error • 404
              </div>
            </div>

            {/* 404 display */}
            <div className="relative text-center mb-6">
              <div className="select-none text-[6rem] sm:text-[8rem] font-extrabold tracking-tight text-white/10 leading-none">
                404
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-5 py-2 rounded-2xl border border-white/10 bg-gray-950/40 backdrop-blur">
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    PAGE NOT FOUND
                  </p>
                </div>
              </div>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-red-500/10 border border-white/10 flex items-center justify-center shadow-lg">
                <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-300" />
              </div>
            </div>

            {/* Message */}
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Oops! We couldn’t find that page.
              </h2>
              <p className="mt-2 text-sm sm:text-base text-white/70 max-w-lg mx-auto leading-relaxed">
                The page you’re looking for might have been removed, renamed, or
                is temporarily unavailable. Try going back, refreshing, or head
                home.
              </p>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-900 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 shadow-lg shadow-yellow-500/20 transform hover:scale-[1.02] active:scale-[0.99] transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </button>

              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>

              <button
                onClick={() => (window.location.href = "/")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white border border-white/15 bg-white/5 hover:bg-white/10 transition"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Decorative dots */}
            <div className="mt-10 flex justify-center gap-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse [animation-delay:120ms]" />
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse [animation-delay:240ms]" />
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent" />
        </div>
      </div>
    </div>
  );
}
