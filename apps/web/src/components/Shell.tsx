import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useSearch } from '../lib/search';
import { useEffect, useRef, useState, type FormEvent } from 'react';

export function Shell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const {
    isSticky,
    inputValue,
    setInputValue,
    fetchSuggestions,
    suggestions,
    setSuggestions,
    isSearchOpen,
    setIsSearchOpen,
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

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = inputValue.trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}` : '/');
    setIsSearchOpen(false);
  }

  return (
    <div className={`shell ${isSticky ? 'sticky-offset' : ''}`}>
      <header className={`topbar ${isSticky ? 'sticky' : ''}`}>
        <div className="shell-content-wrapper">
          <Link to="/" className="brand" aria-label="Kamusi">
            <img src="/logo.png" alt="Kamusi Logo" className="logo-img" />
            <span className="brand-label">Kamusi</span>
          </Link>
          
          {(isSticky || isSearchOpen || (isHomePage && !isSticky)) && (
            <div
              className={`topbar-search ${isHomePage && !isSticky ? 'mobile-home-search' : ''}`}
              ref={searchWrapperRef}
            >
              <form className="input-wrapper" onSubmit={submitSearch}>
                <input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Tafuta neno…"
                  aria-label="Tafuta neno"
                />
                <button
                  className="search-icon-btn"
                  type="submit"
                  aria-label="Tafuta neno"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
              </form>
              
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
            <Link to="/kuhusu" aria-label="Kuhusu" title="Kuhusu">
              <svg className="nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5" />
                <path d="M12 8h.01" />
              </svg>
              <span className="nav-label">Kuhusu</span>
            </Link>
            <Link to="/contribute" aria-label="Changia" title="Changia">
              <svg className="nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              <span className="nav-label">Changia</span>
            </Link>
            {user ? (
              <>
                <Link
                  to="/my-contributions"
                  aria-label="Michango yangu"
                  title="Michango yangu"
                >
                  <svg className="nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
                  </svg>
                  <span className="nav-label">Michango yangu</span>
                </Link>
                <span className="muted nav-user">{user.username}</span>
                <button
                  type="button"
                  className="ghost nav-action"
                  onClick={logout}
                  aria-label="Toka"
                  title="Toka"
                >
                  <svg className="nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 17l5-5-5-5" />
                    <path d="M15 12H3" />
                    <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
                  </svg>
                  <span className="nav-label">Toka</span>
                </button>
              </>
            ) : (
              <Link to="/auth" aria-label="Ingia" title="Ingia">
                <svg className="nav-icon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="M10 17l5-5-5-5" />
                  <path d="M15 12H3" />
                </svg>
                <span className="nav-label">Ingia</span>
              </Link>
            )}
          </nav>

          <div className="topbar-actions">
            <Link
              to={user ? '/my-contributions' : '/auth'}
              className="profile-button"
              aria-label={user ? 'Michango yangu' : 'Ingia'}
              title={user ? 'Michango yangu' : 'Ingia'}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="8" r="4"></circle>
                <path d="M5 19c1.3-2.7 4-4 7-4s5.7 1.3 7 4"></path>
              </svg>
            </Link>
            <button
              type="button"
              className="mobile-menu-toggle"
              aria-label="Fungua menyu"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="mobile-menu" role="menu" aria-label="Menyu ya ukurasa">
            <Link to="/kuhusu" onClick={() => setIsMobileMenuOpen(false)}>Kuhusu</Link>
            <Link to="/contribute" onClick={() => setIsMobileMenuOpen(false)}>Changia</Link>
          </div>
        )}
      </header>
      <Outlet />
    </div>
  );
}
