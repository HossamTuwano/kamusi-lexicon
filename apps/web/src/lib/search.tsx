import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { api, type ApiLemma } from '../lib/api';

interface SearchContextType {
  inputValue: string;
  setInputValue: (val: string) => void;
  onSearch: (e: React.SyntheticEvent<HTMLFormElement>) => void;
  isSticky: boolean;
  setIsSticky: (val: boolean) => void;
  suggestions: ApiLemma[];
  setSuggestions: (val: ApiLemma[]) => void;
  fetchSuggestions: (query: string) => Promise<void>;
  isSearchOpen: boolean;
  setIsSearchOpen: (val: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [inputValue, setInputValue] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [suggestions, setSuggestions] = useState<ApiLemma[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const onSearch = (e: React.SyntheticEvent<HTMLFormElement>) => {
    // Handled in Page components (e.g. HomePage)
  };

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      // Use the search API but we will slice the first 10 in the UI or here
      const data = await api.search(query);
      setSuggestions(data.slice(0, 10));
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
      setSuggestions([]);
    }
  }, []);

  return (
    <SearchContext.Provider value={{ inputValue, setInputValue, onSearch, isSticky, setIsSticky, suggestions, setSuggestions, fetchSuggestions, isSearchOpen, setIsSearchOpen }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
