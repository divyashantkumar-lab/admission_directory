import { useEffect, useState } from 'react';
import cacheService from '../services/cacheService';

export const useCache = () => {
  const [cacheStats, setCacheStats] = useState({
    studentsCount: 0,
    lastUpdated: 'Never',
  });

  const refreshStats = async () => {
    const stats = await cacheService.getCacheStats();
    setCacheStats(stats);
  };

  useEffect(() => {
    refreshStats();
    // Refresh every 30 seconds
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    cacheStats,
    refreshStats,
    clearCache: cacheService.clearAllCache,
  };
};

export default useCache;
