import { useParams, useNavigate } from 'react-router-dom'
import { PartOfSpeechLabels } from '@kamusi/core'
import { useEntryDetail, useEntryReports, useModerateLemma } from '../lib/lemmas'
import { useAuth } from '../lib/auth-context'

function formatDate(d: string | Date | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function Badge({ children, color = 'slate' }: { children: React.ReactNode, color?: string }) {
  const colors: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-md ${colors[color] || colors.slate}`}>
      {children}
    </span>
  )
}

export default function EntryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { role } = useAuth()
  const isMod = role === 'moderator' || role === 'admin'
  const { data: entry, isLoading, isError, error } = useEntryDetail(id!)
  const { data: reports } = useEntryReports(id!, isMod)
  const { mutate: moderate, isPending: isModerating } = useModerateLemma()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (isError || !entry) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-4 cursor-pointer">&larr; Back</button>
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            {isError ? `Error: ${error?.message}` : 'Entry not found.'}
          </div>
        </div>
      </div>
    )
  }

  const statusBadge = entry.isHidden
    ? <Badge color="red">Hidden</Badge>
    : entry.isVerified
      ? <Badge color="green">Verified</Badge>
      : <Badge color="amber">Pending</Badge>

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-8 py-4">
        <button onClick={() => navigate('/')} className="text-sm text-blue-600 hover:underline cursor-pointer">&larr; Dashboard</button>
      </nav>

      <main className="max-w-3xl mx-auto p-8 space-y-8">
        {/* Header */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{entry.word}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge>
                  {PartOfSpeechLabels[entry.partOfSpeech as keyof typeof PartOfSpeechLabels]
                    ? `${PartOfSpeechLabels[entry.partOfSpeech as keyof typeof PartOfSpeechLabels]} (${entry.partOfSpeech})`
                    : entry.partOfSpeech}
                </Badge>
                {statusBadge}
                {(entry.reportCount ?? 0) > 0 && (
                  <Badge color="amber">
                    {entry.reportCount} open report{entry.reportCount === 1 ? '' : 's'}
                  </Badge>
                )}
                <Badge color="blue">v{entry.version}</Badge>
              </div>
            </div>
            {isMod && (
              <div className="flex gap-2 flex-shrink-0">
                {!entry.isVerified && (
                  <button
                    disabled={isModerating}
                    onClick={() => moderate({ id: entry.id, action: 'verify' })}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Verify
                  </button>
                )}
                {!entry.isHidden ? (
                  <button
                    disabled={isModerating}
                    onClick={() => moderate({ id: entry.id, action: 'hide' })}
                    className="bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Hide
                  </button>
                ) : (
                  <button
                    disabled={isModerating}
                    onClick={() => moderate({ id: entry.id, action: 'restore' })}
                    className="bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-600 text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Restore
                  </button>
                )}
              </div>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mt-4">
            {entry.plural && <><dt className="text-slate-500">Plural</dt><dd className="text-slate-800 font-medium">{entry.plural}</dd></>}
            {entry.pronunciation && <><dt className="text-slate-500">Pronunciation</dt><dd className="text-slate-800 font-medium">{entry.pronunciation}</dd></>}
            {entry.dialect && <><dt className="text-slate-500">Dialect</dt><dd className="text-slate-800 font-medium">{entry.dialect}</dd></>}
            {entry.source && <><dt className="text-slate-500">Source</dt><dd className="text-slate-800 font-medium">{entry.source}</dd></>}
            {entry.synonyms?.length > 0 && <><dt className="text-slate-500">Synonyms</dt><dd className="text-slate-800 font-medium">{entry.synonyms.join(', ')}</dd></>}
            {entry.antonyms?.length > 0 && <><dt className="text-slate-500">Antonyms</dt><dd className="text-slate-800 font-medium">{entry.antonyms.join(', ')}</dd></>}
            {entry.derivedWords?.length > 0 && <><dt className="text-slate-500">Derived words</dt><dd className="text-slate-800 font-medium">{entry.derivedWords.join(', ')}</dd></>}
            <dt className="text-slate-500">Votes</dt><dd className="text-slate-800 font-medium">{entry.voteCount ?? 0}</dd>
            <dt className="text-slate-500">Contributor</dt><dd className="text-slate-800 font-medium">#{entry.creatorId || '?'}</dd>
            <dt className="text-slate-500">Created</dt><dd className="text-slate-800 font-medium">{formatDate(entry.createdAt)}</dd>
          </dl>
        </section>

        {/* Senses */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Senses ({entry.senses?.length || 0})</h2>
          {entry.senses?.length ? (
            <ol className="space-y-5">
              {entry.senses.map((s: any, i: number) => (
                <li key={s.id || i} className="border-l-4 border-blue-300 pl-4">
                  <p className="text-slate-800 font-medium">{i + 1}. {s.definition}</p>
                  {s.usageNote && (
                    <p className="text-sm text-slate-500 mt-1">Usage: {s.usageNote}</p>
                  )}
                  {s.examples?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {s.examples.map((ex: any, j: number) => (
                        <li key={ex.id || j} className="text-sm text-slate-600 italic">
                          &ldquo;{ex.sentence}&rdquo;
                          {ex.note && <span className="not-italic text-slate-400 ml-1">({ex.note})</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-slate-400">No senses recorded.</p>
          )}
        </section>

        {/* Contribution History */}
        {entry.contributions?.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Contribution History</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100">
                  <th className="pb-2 font-medium">Action</th>
                  <th className="pb-2 font-medium">User</th>
                  <th className="pb-2 font-medium">Note</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {entry.contributions.map((c: any) => (
                  <tr key={c.id} className="border-b border-slate-50">
                    <td className="py-2">
                      <Badge color={
                        c.action === 'created' ? 'blue'
                          : c.action === 'verified' ? 'green'
                            : c.action === 'hidden' || c.action === 'deleted' ? 'red'
                              : 'slate'
                      }>
                        {c.action}
                      </Badge>
                    </td>
                    <td className="py-2 text-slate-700">#{c.userId}</td>
                    <td className="py-2 text-slate-500">{c.note || '—'}</td>
                    <td className="py-2 text-slate-500">{formatDate(c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Reports */}
        {isMod && (reports?.length ?? 0) > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Reports ({reports.length})
            </h2>
            <p className="text-sm text-slate-500 mb-4">
              Community flags. Verifying or hiding this entry clears all reports.
            </p>
            <ul className="space-y-3">
              {reports.map((r: any) => (
                <li key={r.id} className="border border-slate-100 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-between">
                    <Badge color={r.status === 'open' ? 'amber' : 'slate'}>
                      {r.reason}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      by #{r.userId} &middot; {formatDate(r.createdAt)} &middot; {r.status}
                    </span>
                  </div>
                  {r.note && <p className="text-sm text-slate-600 mt-2">{r.note}</p>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Revisions */}
        {entry.revisions?.length > 0 && (
          <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Revisions</h2>
            <div className="space-y-3">
              {entry.revisions
                .slice()
                .sort((a: any, b: any) => b.version - a.version)
                .map((r: any) => (
                  <details key={r.id} className="border border-slate-100 rounded-lg">
                    <summary className="px-4 py-2 cursor-pointer text-sm hover:bg-slate-50 flex justify-between items-center">
                      <span className="font-medium text-slate-700">
                        Version {r.version}
                      </span>
                      <span className="text-slate-400 text-xs">
                        by #{r.changedBy} &middot; {formatDate(r.createdAt)}
                      </span>
                    </summary>
                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                      <pre className="text-xs text-slate-600 overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(r.snapshot, null, 2)}
                      </pre>
                    </div>
                  </details>
                ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
