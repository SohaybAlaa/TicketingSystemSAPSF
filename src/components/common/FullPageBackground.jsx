export default function FullPageBackground({ children, maxWidth = "md" }) {
  const maxWidthClasses = {
    'sm': 'max-w-sm',
    'md': 'max-w-md',
    'lg': 'max-w-lg',
    'xl': 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-yellow-500/10 blur-3xl rounded-full" />
        <div className="absolute -bottom-28 -right-28 w-[28rem] h-[28rem] bg-red-500/10 blur-3xl rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-yellow-400/5 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:22px_22px] opacity-30" />
      </div>

      <div className={`relative w-full ${maxWidthClasses[maxWidth] || maxWidthClasses['md']}`}>
        {children}
      </div>
    </div>
  );
}
