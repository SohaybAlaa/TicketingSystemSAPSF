/**
 * AnimatedBackground Component
 * 
 * A reusable animated background with gradient blobs and grid pattern overlay.
 * Creates a dynamic, modern background effect with pulsing gradient circles.
 * 
 * @param {string} className - Optional additional CSS classes
 */
export default function AnimatedBackground({ className = "" }) {
  return (
    <>
      {/* Animated Background Elements */}
      <div className={`absolute inset-0 overflow-hidden ${className}`}>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px]" />
    </>
  );
}
