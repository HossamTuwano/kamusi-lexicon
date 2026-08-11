import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type ApiLemma } from '../lib/api';
import { useAuth } from '../lib/auth';

export function EntryPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [lemma, setLemma] = useState<ApiLemma | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voteMsg, setVoteMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api
      .getEntry(id)
      .then(setLemma)
      .catch((err) => setError(err instanceof Error ? err.message : 'Hitilafu'));
  }, [id]);

  async function castVote(vote: 1 | -1) {
    if (!lemma || !token) return;
    setVoteMsg(null);
    try {
      const res = await api.vote(lemma.id, vote, token);
      setLemma({ ...lemma, voteCount: res.voteCount, isVerified: res.isVerified });
      setVoteMsg('Kura imehifadhiwa.');
    } catch (err) {
      setVoteMsg(err instanceof Error ? err.message : 'Hitilafu ya kura');
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!lemma) return <p className="muted">Inapakia…</p>;

  return (
    <article>
      <header className="entry-head">
        <h1>{lemma.word}</h1>
        <span className="badge">
          {lemma.partOfSpeech}
          {lemma.plural ? ` · wingi: ${lemma.plural}` : ''}
          {lemma.isVerified ? ' · imethibitishwa' : ''}
        </span>
        {lemma.dialect && <p className="muted">Lahaja: {lemma.dialect}</p>}
      </header>

      {lemma.senses?.map((sense) => (
        <section key={sense.id ?? sense.definition} className="sense">
          <p>
            <strong>Maana:</strong> {sense.definition}
          </p>
          {sense.usageNote && (
            <p className="muted">
              <em>{sense.usageNote}</em>
            </p>
          )}
          {sense.examples && sense.examples.length > 0 && (
            <ul className="examples">
              {sense.examples.map((ex) => (
                <li key={ex.id ?? ex.sentence}>{ex.sentence}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {(lemma.synonyms?.length || lemma.antonyms?.length || lemma.derivedWords?.length) && (
        <section className="sense">
          {!!lemma.synonyms?.length && (
            <p>
              <strong>Visawe:</strong> {lemma.synonyms.join(', ')}
            </p>
          )}
          {!!lemma.antonyms?.length && (
            <p>
              <strong>Vinyume:</strong> {lemma.antonyms.join(', ')}
            </p>
          )}
          {!!lemma.derivedWords?.length && (
            <p>
              <strong>Maneno yaliyotokana:</strong> {lemma.derivedWords.join(', ')}
            </p>
          )}
        </section>
      )}

      {user && token && (
        <section className="stack" style={{ marginTop: '1.5rem' }}>
          <p className="muted">Kura za jamii: {lemma.voteCount ?? 0}</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn" onClick={() => castVote(1)}>
              Thibitisha (+1)
            </button>
            <button type="button" className="btn secondary" onClick={() => castVote(-1)}>
              Kataa (−1)
            </button>
          </div>
          {voteMsg && <p className="muted">{voteMsg}</p>}
        </section>
      )}
    </article>
  );
}
