import { useCallback, useRef } from "react";

/**
 * Custom hook for debounced API calls
 * Prevents excessive API requests during rapid user interactions
 */
export const useDebouncedApi = (apiCall, delay = 500) => {
  const timeoutRef = useRef(null);
  const lastCallRef = useRef(null);

  const debouncedCall = useCallback(
    async (...args) => {
      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(async () => {
        try {
          const result = await apiCall(...args);
          lastCallRef.current = result;
          return result;
        } catch (error) {
          console.error("Debounced API call error:", error);
          throw error;
        }
      }, delay);
    },
    [apiCall, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return { debouncedCall, cancel, lastCall: lastCallRef.current };
};

/**
 * Custom hook for throttled API calls
 * Ensures minimum time between consecutive API requests
 */
export const useThrottledApi = (apiCall, delay = 1000) => {
  const lastCallTimeRef = useRef(0);
  const pendingCallRef = useRef(null);

  const throttledCall = useCallback(
    async (...args) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTimeRef.current;

      if (timeSinceLastCall >= delay) {
        lastCallTimeRef.current = now;
        try {
          return await apiCall(...args);
        } catch (error) {
          console.error("Throttled API call error:", error);
          throw error;
        }
      } else {
        // Schedule call for later if throttled
        if (pendingCallRef.current) {
          clearTimeout(pendingCallRef.current);
        }

        return new Promise((resolve, reject) => {
          pendingCallRef.current = setTimeout(async () => {
            lastCallTimeRef.current = Date.now();
            try {
              const result = await apiCall(...args);
              resolve(result);
            } catch (error) {
              reject(error);
            }
          }, delay - timeSinceLastCall);
        });
      }
    },
    [apiCall, delay]
  );

  return throttledCall;
};
