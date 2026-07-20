import { useSelector } from 'react-redux';
import useCache from '../hooks/useCache';

export default function CacheStatus() {
  const { fromCache } = useSelector((state) => state.students);
  const { cacheStats, clearCache } = useCache();

  if (!fromCache) return null;

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-md z-40">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
            📦 Offline Mode
          </p>
          <p className="text-xs text-blue-700 mt-1">
            Showing {cacheStats.studentsCount} cached student{cacheStats.studentsCount !== 1 ? 's' : ''}.
            Last updated: {cacheStats.lastUpdated}
          </p>
          <button
            onClick={clearCache}
            className="text-xs mt-2 px-2 py-1 bg-blue-200 hover:bg-blue-300 text-blue-900 rounded font-semibold transition-colors"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
}
