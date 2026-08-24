import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PartOfSpeech, PartOfSpeechLabels, type CreateLemmaInput } from '@kamusi/core';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export function ContributePage() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>(PartOfSpeech.NOUN);
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [plural, setPlural] = useState('');
  const [synonyms, setSynonyms] = useState('');

  if (!user || !token) {
    return (
      <section className="hero">
        <h1>Changia</h1>
        <p>
          Unahitaji kuingia ili kuwasilisha neno.{' '}
          <Link to="/auth">Ingia hapa</Link>.
        </p>
      </section>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const payload: CreateLemmaInput = {
      word: word.trim(),
      partOfSpeech,
      plural: plural.trim() || undefined,
      synonyms: synonyms
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      senses: [
        {
          definition: definition.trim(),
          examples: example.trim()
            ? [{ sentence: example.trim() }]
            : [],
        },
      ],
    };

    try {
      const created = await api.createEntry(payload, token!);
      navigate(`/entries/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hitilafu');
    }
  }

  return (
    <section className="stack">
      <div className="hero" style={{ paddingBottom: '1rem' }}>
        <h1>Changia</h1>
        <p>Wasilisha lema jipya la Kiswahili — maana kwa Kiswahili inahitajika.</p>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Neno
          <input value={word} onChange={(e) => setWord(e.target.value)} required />
        </label>
        <label>
          Aina ya neno
          <select
            value={partOfSpeech}
            onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
          >
            {Object.values(PartOfSpeech).map((pos) => (
              <option key={pos} value={pos}>
                {PartOfSpeechLabels[pos] ? `${PartOfSpeechLabels[pos]} (${pos})` : pos}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ufafanuzi (Kiswahili)
          <textarea
            rows={3}
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            required
          />
        </label>
        <label>
          Mfano wa sentensi
          <input value={example} onChange={(e) => setExample(e.target.value)} />
        </label>
        <label>
          Wingi
          <input value={plural} onChange={(e) => setPlural(e.target.value)} />
        </label>
        <label>
          Visawe (tenganisha kwa koma)
          <input value={synonyms} onChange={(e) => setSynonyms(e.target.value)} />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">
          Wasilisha
        </button>
      </form>
    </section>
  );
}
