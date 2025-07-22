export default function KanbanBoardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-10 w-40 bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-4 min-h-[400px] border border-slate-100">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
            {[1,2,3].map(j => (
              <div key={j} className="bg-slate-100 rounded-lg p-4 mb-4 h-16" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
} 