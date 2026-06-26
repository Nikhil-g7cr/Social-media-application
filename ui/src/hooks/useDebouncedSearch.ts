import { useEffect, useState } from "react";

export const useDebouncedSearch = (initialValue = "", delay = 500) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay]);

  useEffect(() => {
    setSearchTerm(initialValue);
    setDebouncedTerm(initialValue);
  }, [initialValue]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
  };
};
