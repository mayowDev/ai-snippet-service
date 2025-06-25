export default function LoadingSpinner() {
  return (
    <div 
      className="flex justify-center items-center py-8"
      role="status"
      aria-label="Loading content"
    >
      <div 
        className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"
        aria-hidden="true"
      ></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
} 