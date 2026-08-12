import { useEffect } from 'react'
import { usePendingLemmas, useModerateLemma } from '../lib/lemmas'
import { useAuth } from '../lib/auth-context'

export default function DashboardPage() {
  const { logout, role } = useAuth()
  const { data: entries, isLoading, isError, isFetching, error } = usePendingLemmas()
  const { mutate: moderate, isPending: isModerating } = useModerateLemma()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      logout()
    }
  }, [logout])

  if (isError) return (
    <div className="container mx-auto p-8">
      <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
        Error loading entries: {error?.message}
      </div>
    </div>
  )
  
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Kamusi Moderation</h1>
          <p className="text-xs text-slate-400">Role: {role || 'contributor'}</p>
        </div>
        <div className="flex items-center gap-6">
          {isFetching && (
            <span className="text-xs text-slate-400 animate-pulse">Refreshing...</span>
          )}
          <button 
            onClick={logout}
            className="text-sm text-slate-600 hover:text-red-600 hover:font-medium transition-colors duration-200 cursor-pointer px-3 py-1 rounded hover:bg-red-50"
            title="Sign out of your account"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="container mx-auto p-8">
        <header className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Pending Review</h2>
          <p className="text-slate-500">Verify or hide contributions from the community.</p>
          {role !== 'moderator' && role !== 'admin' && (
            <p className="text-sm text-amber-600 mt-2">⚠️ Your account is not a moderator. Contact an admin to enable moderation.</p>
          )}
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : !entries || entries.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
            <p className="text-slate-400 text-lg">No pending entries found. Great job! 🎉</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entries.map((e: any) => (
              <div 
                key={e.id} 
                className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
                style={{ opacity: isModerating ? 0.7 : 1 }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <strong className="text-lg font-bold text-slate-900">{e.word}</strong> 
                    <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded-md uppercase">
                      {e.partOfSpeech}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    by <span className="font-medium">{e.creatorId ? 'Contributor #' + e.creatorId : 'Unknown'}</span>
                  </p>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {e.senses?.[0]?.definition || '(no definition)'}
                  </p>
                  {e.senses?.[0]?.examples?.length > 0 && (
                    <p className="text-sm text-slate-500 italic mb-4">
                      Ex: "{e.senses[0].examples[0].sentence}"
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" 
                    disabled={isModerating || role !== 'moderator' && role !== 'admin'}
                    onClick={() => moderate({ id: e.id, action: 'verify' })}
                    title="Approve this entry for publication"
                  >
                    ✓ Verify
                  </button>
                  <button 
                    className="flex-1 bg-red-50 border border-red-200 hover:bg-red-100 text-red-600 font-medium py-2 px-3 rounded-lg transition-colors duration-200 text-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" 
                    disabled={isModerating || role !== 'moderator' && role !== 'admin'}
                    onClick={() => moderate({ id: e.id, action: 'hide' })}
                    title="Reject or hide this entry"
                  >
                    ✕ Hide
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
