// Singleton service to prevent duplicate optimize-resume API calls
class OptimizeResumeService {
  constructor() {
    this.cache = new Map();
    this.ongoingRequests = new Set();
  }

  // Create a cache key based on the data
  createCacheKey(originalData, atsResult) {
    return JSON.stringify({
      originalData: originalData?.name || '',
      atsResult: atsResult?.overallScore || '',
      timestamp: Math.floor(Date.now() / 1000) // Cache for 1 second
    });
  }

  // Check if we have cached data
  getCachedData(cacheKey) {
    return this.cache.get(cacheKey);
  }

  // Set cached data
  setCachedData(cacheKey, data) {
    this.cache.set(cacheKey, data);
    
    // Clean up old cache entries (keep only last 10)
    if (this.cache.size > 10) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  }

  // Check if request is in progress
  isRequestInProgress(cacheKey) {
    return this.ongoingRequests.has(cacheKey);
  }

  // Mark request as in progress
  markRequestInProgress(cacheKey) {
    this.ongoingRequests.add(cacheKey);
  }

  // Mark request as completed
  markRequestCompleted(cacheKey) {
    this.ongoingRequests.delete(cacheKey);
  }

  // Make the API call with loading state callbacks
  async optimizeResume(originalData, atsResult, onLoadingStart, onLoadingEnd) {
    const cacheKey = this.createCacheKey(originalData, atsResult);
    
    // Check cache first
    const cachedData = this.getCachedData(cacheKey);
    if (cachedData) {
      console.log('✅ Using cached optimized resume data');
      return cachedData;
    }
    
    // Check if request is already in progress
    if (this.isRequestInProgress(cacheKey)) {
      console.log('⚠️ Optimize resume request already in progress, skipping duplicate call');
      return null;
    }
    
    // Mark as in progress and trigger loading start
    this.markRequestInProgress(cacheKey);
    if (onLoadingStart) onLoadingStart();
    
    try {
      console.log('🔧 Making optimize-resume API call...');
      const response = await fetch('/api/optimize-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalResumeData: originalData,
          atsAnalysisResult: atsResult
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to optimize resume');
      }

      const result = await response.json();
      console.log('✅ Optimization completed:', result);
      
      // Cache the result
      this.setCachedData(cacheKey, result);
      
      return result;
      
    } catch (error) {
      console.error('Error optimizing resume:', error);
      throw error;
    } finally {
      this.markRequestCompleted(cacheKey);
      if (onLoadingEnd) onLoadingEnd();
    }
  }
}

// Export singleton instance
export default new OptimizeResumeService();
