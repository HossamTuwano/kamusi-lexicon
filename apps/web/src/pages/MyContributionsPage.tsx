import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  api,
  type ContributionStatus,
  type MyContribution,
} from '../lib/api';
import { useAuth } from '../lib/auth';

const ACTION_LABELS: Record<string, string> = {
  add_sense: 'Ongeza maana',
  add_example: 'Ongeza mfano',
  correct_info: 'Marekebisho',
};

const STATUS_LABELS: Record<ContributionStatus, string> = {
  pending: 'Inasubiri uhakiki',
  approved: 'Imekubaliwa',
  rejected: 'Imekataliwa',
};

const STATUS_CLASSES: Record<ContributionStatus, string> = {
  pending: 'badge pending',
  approved: 'badge approved',
  rejected: 'badge rejected',
};

function proposalSummary(c: MyContribution): string {
  const content = c.proposedContent ?? {};
  if (content.senses?.length) {
    return content.senses
      .map((s) => s.definition)
      .filter(Boolean)
      .join(' · ');
  }
  if (content.examples?.length) {
    return content.examples
      .map((e) => `"${e.sentence}"`)
      .filter((s) => s !== '""')
      .join(' · ');
  }
  if (content.text) return content.text;
  return c.note || '';
}

export function MyContributionsPage() {
  const { token, user } = useAuth();
  const [status, setStatus] = useState<ContributionStatus | ''>('');
  const [items, setItems] = useState<MyContribution[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setItems(null);
    setError(null);
    api
      .myContributions(status || undefined, token)
      .then(setItems)
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Hitilafu'),
      );
  }, [token, status]);

  if (!user || !token) {
    return (
      <section className="hero">
        <h1>Michango yangu</h1>
        <p>
          Unahitaji kuingia ili kuona michango yako.{' '}
          <Link to="/auth">Ingia hapa</Link>.
        </p>
      </section>
    );
  }

  return (
    <section className="stack">
      <div className="hero" style={{ paddingBottom: '1rem' }}>
        <h1>Michango yangu</h1>
        <p>
          Historia ya michango yote uliyoiwasilisha kwa Kamusi na hali yake ya
          uhakiki.
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {(['', 'pending', 'approved', 'rejected'] as const).map((s) => (
          <button
            key={s || 'all'}
            type="button"
            className={status === s ? 'btn' : 'btn secondary'}
            onClick={() => setStatus(s)}
          >
            {s === ''
              ? 'Zote'
              : s === 'pending'
                ? STATUS_LABELS.pending
                : s === 'approved'
                  ? STATUS_LABELS.approved
                  : STATUS_LABELS.rejected}
          </button>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      {!error && items === null && <p className="muted">Inapakia…</p>}

      {items?.length === 0 && (
        <p className="muted">
          Hakuna michango bado.{' '}
          <Link to="/contribute">Changia neno jipya</Link> au pendekeza
          marekebisho kwenye neno lililopo.
        </p>
      )}

      {items && items.length > 0 && (
        <ul className="contrib-list">
          {items.map((c) => (
            <li key={c.id} className="contrib-item">
              <div className="contrib-head">
                {c.lemma ? (
                  <Link to={`/entries/${c.lemma.id}`} className="contrib-word">
                    {c.lemma.word}
                  </Link>
                ) : (
                  <span className="contrib-word">Neno #{c.lemmaId}</span>
                )}
                <span className={STATUS_CLASSES[c.status] ?? 'badge'}>
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
              </div>
              <p className="muted">
                {ACTION_LABELS[c.action] ?? c.action}
                {' · '}
                {new Date(c.createdAt).toLocaleDateString('sw-KE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              {proposalSummary(c) && (
                <p className="contrib-summary">{proposalSummary(c)}</p>
              )}
              {c.status === 'rejected' && c.note && (
                <p className="error">Sababu: {c.note}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
