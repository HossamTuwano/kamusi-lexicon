import { useEffect, useState, SyntheticEvent, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PartOfSpeechLabels } from '@kamusi/core';
import { api, type ApiLemma } from '../lib/api';
import { useSearch } from '../lib/search';

export function HomePage() {
  const { inputValue, setInputValue, isSticky, setIsSticky } = useSearch();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  
  const [results, setResults] = useState<ApiLemma[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);

  // Sync input value if URL changes externally
  useEffect(() => {
    setInputValue(queryFromUrl);
  }, [queryFromUrl, setInputValue]);

  // IntersectionObserver to detect when hero leaves the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '-80px 0px 0px 0px',
      }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [setIsSticky]);

  // Trigger search or load initial list when the URL query changes
  useEffect(() => {
    async function performSearch() {
      setLoading(true);
      setError(null);
      try {
        if (!queryFromUrl) {
          const data = await api.list();
          setResults(data);
        } else {
          const data = await api.search(queryFromUrl);
          setResults(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Hitilafu');
        setResults(null);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
  }, [queryFromUrl]);

  async function onSearch(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) {
      setSearchParams({});
      return;
    }
    setSearchParams({ q: query });
  }

  return (
    <section>
      <div className="hero" ref={heroRef}>

        <h1>Kamusi</h1>
        <p>
          Kamusi ya Kiswahili inayoeleza maana, mifano, na
          matumizi.
        </p>
        <form className="search-row" onSubmit={onSearch}>
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Tafuta neno… mfano: gari"
            aria-label="Tafuta neno"
          />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? 'Inatafuta…' : 'Tafuta'}
          </button>
        </form>
      </div>

      {/* Debugging label for CP1 Proof */}
      <div style={{ position: 'fixed', top: 10, right: 10, background: 'black', color: 'white', padding: '5px', zIndex: 1000, fontSize: '12px' }}>
        Mode: {isSticky ? 'Sticky' : 'Standard'}
      </div>

      {error && <p className="error">{error}</p>}

      {results && (
        <div className="results">
          {results.length === 0 ? (
            <p className="muted">Hakuna matokeo.</p>
          ) : (
            results.map((lemma) => (
              <Link key={lemma.id} className="result-link" to={`/entries/${lemma.id}`}>
                <strong>{lemma.word}</strong>
                <span className="meta">
                  {PartOfSpeechLabels[lemma.partOfSpeech]
                    ? `${PartOfSpeechLabels[lemma.partOfSpeech]} (${lemma.partOfSpeech})`
                    : lemma.partOfSpeech}
                  {lemma.senses?.[0]?.definition
                    ? ` — ${lemma.senses[0].definition}`
                    : ''}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </section>
  );
}
