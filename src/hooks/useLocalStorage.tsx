import { useState } from "react";

export const useLocalStorage = <T,>(keyName: string, defaultValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const value = window.localStorage.getItem(keyName);
      return value ? JSON.parse(value) : defaultValue;
    } catch (err) {
      console.error("Erro ao acessar localStorage:", err);
      return defaultValue;
    }
  });

  const setValue = (newValue: T) => {
    try {
      window.localStorage.setItem(keyName, JSON.stringify(newValue));
      setStoredValue(newValue);
    } catch (err) {
      console.error("Erro ao salvar no localStorage", err);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(keyName);
      setStoredValue(defaultValue);
    } catch (err) {
      console.error("Erro ao remover do localStorage:", err);
    }
  };

  return [storedValue, setValue, removeValue] as const;
};

