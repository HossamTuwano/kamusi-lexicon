import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PartOfSpeechLabels } from '@kamusi/core';
import {
  api,
  type ApiLemma,
  type ContributionAction,
  type ReportReason,
} from '../lib/api';
import { useAuth } from '../lib/auth';

const REPORT_REASONS: Array<{ value: ReportReason; label: string }> = [
  { value: 'spam', label: 'Uchafu / matangazo' },
  { value: 'offensive', label: 'Matusi' },
  { value: 'wrong', label: 'Maana si sahihi' },
  { value: 'duplicate', label: 'Nakala / inarudiwa' },
  { value: 'other', label: 'Nyingine' },
];

const CONTRIBUTION_OPTIONS: Array<{ value: ContributionAction; label: string }> = [
  { value: 'add_sense', label: '+ Ongeza maana' },
  { value: 'add_example', label: '+ Ongeza mfano' },
  { value: 'correct_info', label: '+ Pendekeza marekebisho' },
];

export function EntryPage() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const [lemma, setLemma] = useState<ApiLemma | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [voteMsg, setVoteMsg] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState<ReportReason>('other');
  const [reportNote, setReportNote] = useState('');
  const [reportMsg, setReportMsg] = useState<string | null>(null);
  const [reportSent, setReportSent] = useState(false);
  const [contribOpen, setContribOpen] = useState<ContributionAction | null>(null);
  const [senseDefinition, setSenseDefinition] = useState('');
  const [senseExample, setSenseExample] = useState('');
  const [exampleSentence, setExampleSentence] = useState('');
  const [correctionText, setCorrectionText] = useState('');
  const [contribMsg, setContribMsg] = useState<string | null>(null);
  const [contribSent, setContribSent] = useState(false);

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

  async function submitReport() {
    if (!lemma || !token) return;
    setReportMsg(null);
    try {
      await api.report(
        lemma.id,
        { reason: reportReason, note: reportNote.trim() || undefined },
        token,
      );
      setReportSent(true);
      setReportMsg('Asante! Ripoti imepokelewa kwa wasimamizi.');
    } catch (err) {
      setReportMsg(err instanceof Error ? err.message : 'Hitilafu ya ripoti');
    }
  }

  async function submitContribution() {
    if (!lemma || !token || !contribOpen) return;
    setContribMsg(null);

    const payload =
      contribOpen === 'add_sense'
        ? {
            action: contribOpen,
            proposedSenses: [
              {
                definition: senseDefinition.trim(),
                examples: senseExample.trim()
                  ? [{ sentence: senseExample.trim() }]
                  : undefined,
              },
            ],
          }
        : contribOpen === 'add_example'
          ? {
              action: contribOpen,
              proposedExamples: [{ sentence: exampleSentence.trim() }],
            }
          : { action: contribOpen, proposedText: correctionText.trim() };

    try {
      await api.contribute(lemma.id, payload, token);
      setContribSent(true);
      setContribOpen(null);
      setContribMsg('Asante! Mchango wako umepokelewa na unasubiri uhakiki.');
    } catch (err) {
      setContribMsg(err instanceof Error ? err.message : 'Hitilafu ya mchango');
    }
  }

  if (error) return <p className="error">{error}</p>;
  if (!lemma) return <p className="muted">Inapakia…</p>;

  return (
    <article>
      <header className="entry-head">
        <h1>{lemma.word}</h1>
        <span className="badge">
          {PartOfSpeechLabels[lemma.partOfSpeech]
            ? `${PartOfSpeechLabels[lemma.partOfSpeech]} (${lemma.partOfSpeech})`
            : lemma.partOfSpeech}
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
          <p className="muted">Unayo taarifa zaidi kuhusu neno hili?</p>
          {!contribSent && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {CONTRIBUTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className="btn secondary"
                  onClick={() => {
                    setContribOpen(contribOpen === opt.value ? null : opt.value);
                    setContribMsg(null);
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {contribOpen === 'add_sense' && !contribSent && (
            <div className="stack">
              <label>
                Maana mpya (Kiswahili)
                <textarea
                  rows={3}
                  value={senseDefinition}
                  onChange={(e) => setSenseDefinition(e.target.value)}
                  required
                />
              </label>
              <label>
                Mfano wa sentensi (si lazima)
                <input
                  value={senseExample}
                  onChange={(e) => setSenseExample(e.target.value)}
                />
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={submitContribution}
                  disabled={!senseDefinition.trim()}
                >
                  Wasilisha maana
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setContribOpen(null)}
                >
                  Ghairi
                </button>
              </div>
            </div>
          )}

          {contribOpen === 'add_example' && !contribSent && (
            <div className="stack">
              <label>
                Mfano mpya wa sentensi
                <input
                  value={exampleSentence}
                  onChange={(e) => setExampleSentence(e.target.value)}
                  required
                />
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={submitContribution}
                  disabled={!exampleSentence.trim()}
                >
                  Wasilisha mfano
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setContribOpen(null)}
                >
                  Ghairi
                </button>
              </div>
            </div>
          )}

          {contribOpen === 'correct_info' && !contribSent && (
            <div className="stack">
              <label>
                Marekebisho unayopendekeza
                <textarea
                  rows={3}
                  value={correctionText}
                  onChange={(e) => setCorrectionText(e.target.value)}
                  required
                />
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  className="btn"
                  onClick={submitContribution}
                  disabled={!correctionText.trim()}
                >
                  Wasilisha marekebisho
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setContribOpen(null)}
                >
                  Ghairi
                </button>
              </div>
            </div>
          )}

          {contribMsg && <p className="muted">{contribMsg}</p>}
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

      {user && token && (
        <section className="stack" style={{ marginTop: '1.5rem' }}>
          {!reportOpen && !reportSent && (
            <button
              type="button"
              className="btn secondary"
              onClick={() => setReportOpen(true)}
            >
              Ripoti tatizo
            </button>
          )}

          {reportOpen && !reportSent && (
            <div className="stack">
              <p className="muted">Ni nini kimekosea?</p>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value as ReportReason)}
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              <textarea
                rows={2}
                placeholder="Maelezo (si lazima)…"
                value={reportNote}
                onChange={(e) => setReportNote(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn" onClick={submitReport}>
                  Tuma ripoti
                </button>
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setReportOpen(false)}
                >
                  Ghairi
                </button>
              </div>
            </div>
          )}

          {reportMsg && <p className="muted">{reportMsg}</p>}
        </section>
      )}
    </article>
  );
}
