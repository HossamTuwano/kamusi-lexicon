import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useSearch } from '../lib/search';
import { useEffect, useRef } from 'react';

export function Shell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { 
    isSticky, 
    inputValue, 
    setInputValue, 
    fetchSuggestions, 
    suggestions, 
    setSuggestions,
    isSearchOpen,
    setIsSearchOpen 
  } = useSearch();
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSticky && !isSearchOpen) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      if (inputValue) {
        fetchSuggestions(inputValue);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, isSticky, isSearchOpen, fetchSuggestions, setSuggestions]);

  useEffect(() => {
    if (suggestions.length > 0) {
      const handler = (e: MouseEvent | TouchEvent) => {
        if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
          setSuggestions([]);
        }
      };
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler);
      return () => {
        document.removeEventListener('mousedown', handler);
        document.removeEventListener('touchstart', handler);
      };
    }
  }, [suggestions]);

  const isHomePage = location.pathname === '/';

  return (
    <div className={`shell ${isSticky ? 'sticky-offset' : ''}`}>
      <header className={`topbar ${isSticky ? 'sticky' : ''}`}>
        <div className="shell-content-wrapper">
          <Link to="/" className="brand">
            <img src="/logo.png" alt="Kamusi Logo" className="logo-img" />
            Kamusi
          </Link>
          
          {(isSticky || isSearchOpen) && (
            <div className="topbar-search" ref={searchWrapperRef}>
              <div className="input-wrapper">
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tafuta neno…"
                  aria-label="Tafuta neno"
                />
                <button className="search-icon-btn" type="submit">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </div>
              
              {suggestions.length > 0 && (
                <div className="suggestions-dropdown">
                  {suggestions.map((lemma) => (
                    <Link 
                      key={lemma.id} 
                      to={`/entries/${lemma.id}`} 
                      className="suggestion-item"
                      onClick={() => setSuggestions([])}
                    >
                      <strong>{lemma.word}</strong>
                      <span className="suggestion-pos">
                        ({lemma.partOfSpeech})
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          <nav className="nav-links">
            {!isHomePage && !isSearchOpen && (
              <button 
                className="ghost search-toggle" 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Toggle Search"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            )}
            <Link to="/kuhusu">Kuhusu</Link>
            <Link to="/contribute">Changia</Link>
            {user ? (
              <>
                <Link to="/my-contributions">Michango yangu</Link>
                <span className="muted">{user.username}</span>
                <button type="button" className="ghost" onClick={logout}>
                  Toka
                </button>
              </>
            ) : (
              <Link to="/auth">Ingia</Link>
            )}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  );
}
