import { useEffect, useState, SyntheticEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PartOfSpeechLabels } from '@kamusi/core';
import { api, type ApiLemma } from '../lib/api';

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  
  const [inputValue, setInputValue] = useState(queryFromUrl);
  const [results, setResults] = useState<ApiLemma[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Sync input value if URL changes externally (e.g. browser back button)
  useEffect(() => {
    setInputValue(queryFromUrl);
  }, [queryFromUrl]);

  // Trigger search when the URL query changes
  useEffect(() => {
    async function performSearch() {
      if (!queryFromUrl) {
        setResults([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await api.search(queryFromUrl);
        setResults(data);
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
      <div className="hero">
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
