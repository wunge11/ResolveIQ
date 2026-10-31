/**
 * useLocalStorage.js
 * Custom hook untuk membaca dan menulis data ke localStorage dengan fallback seed.
 * Semua akses localStorage dibungkus try/catch agar tidak crash jika storage penuh
 * atau akses diblokir (misalnya mode private browser tertentu).
 *
 * @param {string} key         - Kunci localStorage (format: "resolveiq:v1:...")
 * @param {*}      initialValue - Nilai awal / seed jika kunci belum ada
 * @returns {[*, Function]} Tuple [value, setValue] mirip useState
 */

import { useState, useCallback } from 'react';

function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  /**
   * Menyimpan nilai baru ke state dan localStorage.
   * Mendukung fungsi updater (seperti setState).
   * @param {*|Function} value - Nilai baru atau fungsi updater (prevValue => newValue)
   */
  const setValue = useCallback((value) => {
    try {
      setStoredValue(prev => {
        const newValue = typeof value === 'function' ? value(prev) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        } catch {
          // Storage penuh atau diblokir — update state saja tanpa persist
        }
        return newValue;
      });
    } catch {
      // Fallback: tidak ada efek samping
    }
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;
