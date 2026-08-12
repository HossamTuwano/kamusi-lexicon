import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  usePendingLemmas,
  useHiddenLemmas,
  useModerateLemma,
} from '../lib/lemmas'
import { useAuth } from '../lib/auth-context'

type ModerationAction = 'verify' | 'hide' | 'restore'

function EntryCard({
  entry,
  isMod,
  isModerating,
  onModerate,
}: {
  entry: any
  isMod: boolean
  isModerating: boolean
  onModerate: (action: ModerationAction) => void
}) {
  const navigate = useNavigate()
  const isHidden = !!entry.isHidden
  const canModerate = isMod

  return (
    <div
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
      style={{ opacity: isModerating ? 0.7 : 1 }}
    >
      <div className="cursor-pointer" onClick={() => navigate(`/entries/${entry.id}`)}>
        <div className="flex justify-between items-start mb-2">
          <strong className="text-lg font-bold text-slate-900">{entry.word}</strong>
          <div className="flex gap-1.5">
            {isHidden && (
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-md uppercase">
                Hidden
              </span>
            )}
            <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md uppercase">
              {entry.partOfSpeech}
            </span>
          </div>
        </div>
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
}: {
  entries: any[] | undefined
  isLoading: boolean
  isMod: boolean
  query: string
  emptyText: string
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {entries.map((entry: any) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          isMod={isMod}
          isModerating={isModerating}
          onModerate={(action) => moderate({ id: entry.id, action })}
        />
      ))}
    </div>
  )
}

function PendingPanel({ q, isMod }: { q: string; isMod: boolean }) {
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
    />
  )
}

function HiddenPanel({ q, isMod }: { q: string; isMod: boolean }) {
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
    />
  )
}

export default function DashboardPage() {
  const { logout, role } = useAuth()
  const [tab, setTab] = useState<'pending' | 'hidden'>('pending')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) logout()
  }, [logout])

  const isMod = role === 'moderator' || role === 'admin'

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Kamusi Moderation</h1>
          <p className="text-xs text-slate-400">Role: {role || 'contributor'}</p>
        </div>
        <button
          onClick={logout}
          className="text-sm text-slate-600 hover:text-red-600 hover:font-medium transition-colors duration-200 cursor-pointer px-3 py-1 rounded hover:bg-red-50"
        >
          Logout
        </button>
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
            onClick={() => setTab('hidden')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              tab === 'hidden'
                ? 'bg-red-600 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Hidden
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

        {tab === 'pending'
          ? <PendingPanel q={debouncedSearch} isMod={isMod} />
          : <HiddenPanel q={debouncedSearch} isMod={isMod} />}
      </main>
    </div>
  )
}
