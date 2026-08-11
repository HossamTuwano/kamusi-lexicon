import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type ApiLemma } from '../lib/api';

export function HomePage() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<ApiLemma[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setResults(await api.search(query));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hitilafu');
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section>
      <div className="hero">
        <h1>Kamusi</h1>
        <p>
          Kamusi ya Kiswahili inayoeleza Kiswahili kwa Kiswahili — maana, mifano, na
          matumizi.
        </p>
        <form className="search-row" onSubmit={onSearch}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
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
                  {lemma.partOfSpeech}
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
