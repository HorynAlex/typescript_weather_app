import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  //State Initialization. Declares the state variable (storedValue) and its setter function (setStoredValue). The initial state is determined by an arrow function, which ensures the localStorage operation runs only once, during the initial render.
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      //Read from Storage. Attempts to retrieve the stored item from the browser's localStorage using the provided key.
      //Process Value. If an item is found (it's not null), it's parsed from JSON back into a JavaScript object/value. Otherwise, the provided initialValue is used.
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      //Write to Storage. Saves the current storedValue to localStorage under the specified key. The value must first be converted into a JSON string via JSON.stringify().
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue] as const;
}
