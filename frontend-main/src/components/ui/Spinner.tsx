export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent ${className}`}
    />
  );
}
