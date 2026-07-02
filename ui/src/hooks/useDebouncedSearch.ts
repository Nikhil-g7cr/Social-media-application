import { useCallback, useEffect, useState } from "react";

export const SEARCH_INPUT_MAX_LENGTH = 50;

const limitSearchTerm = (value: string, maxLength: number) =>
  value.slice(0, maxLength);

export const useDebouncedSearch = (
  initialValue = "",
  delay = 500,
  maxLength = SEARCH_INPUT_MAX_LENGTH,
) => {
  const [searchTerm, setSearchTermState] = useState(() =>
    limitSearchTerm(initialValue, maxLength),
  );
  const [debouncedTerm, setDebouncedTerm] = useState(() =>
    limitSearchTerm(initialValue, maxLength),
  );

  const setSearchTerm = useCallback(
    (value: React.SetStateAction<string>) => {
      setSearchTermState((currentValue) => {
        const nextValue =
          typeof value === "function" ? value(currentValue) : value;

        return limitSearchTerm(nextValue, maxLength);
      });
    },
    [maxLength],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTerm(limitSearchTerm(searchTerm, maxLength));
    }, delay);

    return () => clearTimeout(timer);
  }, [searchTerm, delay, maxLength]);

  useEffect(() => {
    const limitedInitialValue = limitSearchTerm(initialValue, maxLength);
    setSearchTermState(limitedInitialValue);
    setDebouncedTerm(limitedInitialValue);
  }, [initialValue, maxLength]);

  return {
    searchTerm,
    setSearchTerm,
    debouncedTerm,
    maxLength,
  };
};
