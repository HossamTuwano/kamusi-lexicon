import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PartOfSpeechLabels } from '@kamusi/core'
import {
  usePendingLemmas,
  useHiddenLemmas,
  useReportedLemmas,
  useProposals,
  useApproveProposal,
  useRejectProposal,
  useModerateLemma,
  useBulkModerateLemma,
} from '../lib/lemmas'
import { useAuth } from '../lib/auth-context'

type ModerationAction = 'verify' | 'hide' | 'restore'

const ACTION_LABELS: Record<string, string> = {
  add_sense: 'Add sense',
  add_example: 'Add example',
  correct_info: 'Correction',
}

function EntryCard({
  entry,
  isMod,
  isModerating,
  selected,
  onToggleSelect,
  onModerate,
}: {
  entry: any
  isMod: boolean
  isModerating: boolean
  selected: boolean
  onToggleSelect: (id: number) => void
  onModerate: (action: ModerationAction) => void
}) {
  const navigate = useNavigate()
  const isHidden = !!entry.isHidden
  const canModerate = isMod

  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-200 flex flex-col justify-between ${
        selected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'
      }`}
      style={{ opacity: isModerating ? 0.7 : 1 }}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/entries/${entry.id}`)}>
            {isMod && (
              <input
                type="checkbox"
                checked={selected}
                onChange={(e) => {
                  e.stopPropagation()
                  onToggleSelect(entry.id)
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 accent-blue-600 cursor-pointer"
              />
            )}
            <strong className="text-lg font-bold text-slate-900">{entry.word}</strong>
          </div>
          <div className="flex gap-1.5">
            {isHidden && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-md uppercase">
                Hidden
              </span>
            )}
            {(entry.reportCount ?? 0) > 0 && (
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-md uppercase">
                {entry.reportCount} report{entry.reportCount === 1 ? '' : 's'}
              </span>
            )}
            <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md uppercase">
              {PartOfSpeechLabels[entry.partOfSpeech as keyof typeof PartOfSpeechLabels]
                ? `${PartOfSpeechLabels[entry.partOfSpeech as keyof typeof PartOfSpeechLabels]} (${entry.partOfSpeech})`
                : entry.partOfSpeech}
            </span>
          </div>
        </div>
        <div className="cursor-pointer" onClick={() => navigate(`/entries/${entry.id}`)}>
          <p className="text-xs text-slate-400 mb-3">
            by <span className="font-medium">{entry.creatorId ? 'Contributor #' + entry.creatorId : 'Unknown'}</span>
          </p>
          <p className="text-slate-600 leading-relaxed mb-2">
            {entry.senses?.[0]?.definition || '(no definition)'}
          </p>
          {entry.senses?.[0]?.examples?.length > 0 && (
            <p className="text-sm text-slate-500 italic mb-4">
              Ex: &ldquo;{entry.senses[0].examples[0].sentence}&rdquo;
            </p>
          )}
          <p className="text-xs text-blue-500 hover:underline mb-4">View full details &rarr;</p>
        </div>
      </div>
      <div className="flex gap-2">
        {isHidden ? (
          <button
            className="flex-1 bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-600 font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isModerating || !canModerate}
            onClick={() => onModerate('restore')}
          >
            Restore
          </button>
        ) : (
          <>
            <button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isModerating || !canModerate}
              onClick={() => onModerate('verify')}
            >
              Verify
            </button>
            <button
              className="flex-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isModerating || !canModerate}
              onClick={() => onModerate('hide')}
            >
              Hide
            </button>
          </>
        )}
      </div>
    </div>
  )
}

function LemmaGrid({
  entries,
  isLoading,
  isMod,
  query,
  emptyText,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: {
  entries: any[] | undefined
  isLoading: boolean
  isMod: boolean
  query: string
  emptyText: string
  selectedIds: Set<number>
  onToggleSelect: (id: number) => void
  onSelectAll: (ids: number[], selectAll: boolean) => void
}) {
  const { mutate: moderate, isPending: isModerating } = useModerateLemma()

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-400 text-lg">
          {query ? `No matching entries.` : emptyText}
        </p>
      </div>
    )
  }

  const allSelected = entries.every((e) => selectedIds.has(e.id))

  return (
    <div className="space-y-4">
      {isMod && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 px-4 py-2">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected && entries.length > 0}
              onChange={() => onSelectAll(entries.map((e) => e.id), !allSelected)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            Select all ({entries.length})
          </label>
          {selectedIds.size > 0 && (
            <span className="text-sm font-medium text-blue-600">{selectedIds.size} selected</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {entries.map((entry: any) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            isMod={isMod}
            isModerating={isModerating}
            selected={selectedIds.has(entry.id)}
            onToggleSelect={onToggleSelect}
            onModerate={(action) => moderate({ id: entry.id, action })}
          />
        ))}
      </div>
    </div>
  )
}

function ProposalCard({ proposal }: { proposal: any }) {
  const { mutate: approve, isPending: isApproving } = useApproveProposal()
  const { mutate: reject, isPending: isRejecting } = useRejectProposal()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const busy = isApproving || isRejecting

  const content = proposal.proposedContent ?? {}

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
        <div>
          <span className="text-lg font-bold text-slate-900">
            {proposal.lemma?.word || `#${proposal.lemmaId}`}
          </span>
          {proposal.lemma && (
            <span className="ml-2 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md uppercase">
              {proposal.lemma.partOfSpeech}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-md uppercase">
            {ACTION_LABELS[proposal.action] || proposal.action}
          </span>
          <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-700 rounded-md uppercase">
            {proposal.status}
          </span>
        </div>
      </div>

      <div className="text-slate-700 space-y-2 mb-3">
        {content.senses?.map((s: any, i: number) => (
          <p key={i}>
            <span className="text-slate-400 text-sm">Sense: </span>
            {s.definition}
            {s.examples?.map((ex: any, j: number) => (
              <em key={j} className="block text-sm text-slate-500 ml-4">
                &ldquo;{ex.sentence}&rdquo;
              </em>
            ))}
          </p>
        ))}
        {content.examples?.map((ex: any, i: number) => (
          <p key={i} className="italic">
            &ldquo;{ex.sentence}&rdquo;
          </p>
        ))}
        {content.text && <p>{content.text}</p>}
      </div>

      {proposal.note && (
        <p className="text-sm text-slate-500 italic mb-3">Note: {proposal.note}</p>
      )}

      <p className="text-xs text-slate-400 mb-4">
        by{' '}
        <span className="font-medium">
          {proposal.username ? proposal.username : 'User #' + proposal.userId}
        </span>{' '}
        &middot; {new Date(proposal.createdAt).toLocaleString('en-GB')}
      </p>

      {rejecting ? (
        <div className="space-y-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <div className="flex gap-2">
            <button
              disabled={busy || !reason.trim()}
              onClick={() => reject({ id: proposal.id, reason: reason.trim() })}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Confirm reject
            </button>
            <button
              onClick={() => {
                setRejecting(false)
                setReason('')
              }}
              className="text-sm text-slate-500 hover:text-slate-700 py-2 px-3 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            disabled={busy}
            onClick={() => approve(proposal.id)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Approve
          </button>
          <button
            disabled={busy}
            onClick={() => setRejecting(true)}
            className="flex-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}

function ProposalsPanel() {
  const { data: proposals, isLoading, isError, error } = useProposals('pending')

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
        Error loading proposals: {error?.message}
      </div>
    )
  }

  if (!proposals || proposals.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-400 text-lg">No pending proposals.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {proposals.map((p: any) => (
        <ProposalCard key={p.id} proposal={p} />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { logout, role } = useAuth()
  const [tab, setTab] = useState<'pending' | 'proposals' | 'hidden' | 'reported'>('pending')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const { mutate: bulkModerate, isPending: isBulkModerating } = useBulkModerateLemma()

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setSelectedIds(new Set())
  }, [tab])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) logout()
  }, [logout])

  const isMod = role === 'moderator' || role === 'admin'

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = (ids: number[], selectAll: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (selectAll) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  const runBulk = (action: ModerationAction) => {
    if (selectedIds.size === 0) return
    bulkModerate(
      { ids: [...selectedIds], action },
      {
        onSuccess: () => setSelectedIds(new Set()),
      },
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Kamusi Moderation</h1>
          <p className="text-xs text-slate-400">Role: {role || 'contributor'}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/users" className="text-sm text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
            Users
          </Link>
          <button
            onClick={logout}
            className="text-sm text-slate-600 hover:text-red-600 hover:font-medium transition-colors duration-200 cursor-pointer px-3 py-1 rounded hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Moderation</h2>
          <p className="text-slate-500">Review, verify, hide, or restore community contributions.</p>
          {!isMod && (
            <p className="text-sm text-amber-600 mt-2">Your account is not a moderator. Contact an admin to enable moderation.</p>
          )}
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              tab === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setTab('proposals')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              tab === 'proposals'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Proposals
          </button>
          <button
            onClick={() => setTab('hidden')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              tab === 'hidden'
                ? 'bg-red-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Hidden
          </button>
          <button
            onClick={() => setTab('reported')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              tab === 'reported'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Reported
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries by word..."
            className="w-full max-w-md px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-white"
          />
        </div>

        {/* Bulk action bar */}
        {isMod && selectedIds.size > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-3">
            <span className="text-sm font-medium text-blue-700">
              {selectedIds.size} entry{selectedIds.size === 1 ? '' : 's'} selected
            </span>
            <div className="flex gap-2">
              {tab === 'hidden' ? (
                <button
                  disabled={isBulkModerating}
                  onClick={() => runBulk('restore')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Restore selected
                </button>
              ) : (
                <>
                  <button
                    disabled={isBulkModerating}
                    onClick={() => runBulk('verify')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Verify selected
                  </button>
                  <button
                    disabled={isBulkModerating}
                    onClick={() => runBulk('hide')}
                    className="bg-red-50 border border-red-300 hover:bg-red-100 text-red-600 text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Hide selected
                  </button>
                </>
              )}
              <button
                disabled={isBulkModerating}
                onClick={() => setSelectedIds(new Set())}
                className="text-sm text-slate-500 hover:text-slate-700 py-2 px-3 rounded-lg transition-colors cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {tab === 'pending'
          ? <PendingPanel q={debouncedSearch} isMod={isMod} selectedIds={selectedIds} onToggleSelect={toggleSelect} onSelectAll={selectAll} />
          : tab === 'proposals'
            ? <ProposalsPanel />
            : tab === 'reported'
              ? <ReportedPanel q={debouncedSearch} isMod={isMod} selectedIds={selectedIds} onToggleSelect={toggleSelect} onSelectAll={selectAll} />
              : <HiddenPanel q={debouncedSearch} isMod={isMod} selectedIds={selectedIds} onToggleSelect={toggleSelect} onSelectAll={selectAll} />}
      </main>
    </div>
  )
}

function PendingPanel({
  q,
  isMod,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: {
  q: string
  isMod: boolean
  selectedIds: Set<number>
  onToggleSelect: (id: number) => void
  onSelectAll: (ids: number[], selectAll: boolean) => void
}) {
  const { data: entries, isLoading, isError, error } = usePendingLemmas(q)

  if (isError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
        Error loading entries: {error?.message}
      </div>
    )
  }

  return (
    <LemmaGrid
      entries={entries}
      isLoading={isLoading}
      isMod={isMod}
      query={q}
      emptyText="No pending entries. Great job!"
      selectedIds={selectedIds}
      onToggleSelect={onToggleSelect}
      onSelectAll={onSelectAll}
    />
  )
}

function HiddenPanel({
  q,
  isMod,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: {
  q: string
  isMod: boolean
  selectedIds: Set<number>
  onToggleSelect: (id: number) => void
  onSelectAll: (ids: number[], selectAll: boolean) => void
}) {
  const { data: entries, isLoading, isError, error } = useHiddenLemmas(q)

  if (isError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
        Error loading hidden entries: {error?.message}
      </div>
    )
  }

  return (
    <LemmaGrid
      entries={entries}
      isLoading={isLoading}
      isMod={isMod}
      query={q}
      emptyText="No hidden entries."
      selectedIds={selectedIds}
      onToggleSelect={onToggleSelect}
      onSelectAll={onSelectAll}
    />
  )
}

function ReportedPanel({
  q,
  isMod,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}: {
  q: string
  isMod: boolean
  selectedIds: Set<number>
  onToggleSelect: (id: number) => void
  onSelectAll: (ids: number[], selectAll: boolean) => void
}) {
  const { data: entries, isLoading, isError, error } = useReportedLemmas(q)

  if (isError) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
        Error loading reported entries: {error?.message}
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        Entries flagged by the community. Verifying or hiding an entry clears its reports.
      </p>
      <LemmaGrid
        entries={entries}
        isLoading={isLoading}
        isMod={isMod}
        query={q}
        emptyText="No reported entries. Clean community!"
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        onSelectAll={onSelectAll}
      />
    </div>
  )
}
