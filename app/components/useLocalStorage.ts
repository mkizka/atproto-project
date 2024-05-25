/* eslint-disable no-console */
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useState } from "react";

export const useLocalStorage = <T>(
  key: string,
  initialValue?: T,
): [T | null, Dispatch<SetStateAction<T | null>>] => {
  const [storedValue, setStoredValue] = useState<T | null>(
    initialValue ?? null,
  );

  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      setStoredValue(item ? (JSON.parse(item) as T) : initialValue ?? null);
    } catch (error) {
      console.error(error);
    }
  }, [key, initialValue]);

  const setValue: Dispatch<SetStateAction<T | null>> = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(error);
      }
    },
    [storedValue],
  );

  return [storedValue, setValue];
};
