import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { useUsers, useUpdateUserRole } from '../lib/users'
import type { UserRole } from '@kamusi/core'

function formatDate(d: string | Date | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    moderator: 'bg-blue-100 text-blue-700',
    contributor: 'bg-slate-100 text-slate-600',
  }
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-md uppercase ${styles[role] || styles.contributor}`}>
      {role}
    </span>
  )
}

export default function UsersPage() {
  const { role: myRole, userId: myUserId, logout } = useAuth()
  const { data: users, isLoading, isError, error } = useUsers()
  const { mutate: updateRole, isPending } = useUpdateUserRole()

  const isAdmin = myRole === 'admin'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Kamusi Users</h1>
          <p className="text-xs text-slate-400">Role: {myRole || 'contributor'}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm text-slate-600 hover:text-blue-600 transition-colors cursor-pointer">
            Dashboard
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
          <h2 className="text-2xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-500">Promote or demote contributors and moderators. Admins only.</p>
          {!isAdmin && (
            <p className="text-sm text-amber-600 mt-2">Only admins can change user roles. Your actions are read-only.</p>
          )}
        </header>

        {isError ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            Error loading users: {error?.message}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-100 bg-slate-50">
                  <th className="px-6 py-3 font-medium">ID</th>
                  <th className="px-6 py-3 font-medium">Username</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Reputation</th>
                  <th className="px-6 py-3 font-medium">Joined</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u: any) => {
                  const isSelf = u.id === myUserId
                  return (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                      <td className="px-6 py-3 text-slate-500">{u.id}</td>
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {u.username}
                        {isSelf && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                      </td>
                      <td className="px-6 py-3 text-slate-600">{u.email}</td>
                      <td className="px-6 py-3"><RoleBadge role={u.role} /></td>
                      <td className="px-6 py-3 text-slate-600">{u.reputationScore ?? 0}</td>
                      <td className="px-6 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-3">
                        {isAdmin && !isSelf ? (
                          <div className="flex gap-1.5">
                            {u.role === 'contributor' && (
                              <button
                                disabled={isPending}
                                onClick={() => updateRole({ id: u.id, role: 'moderator' as UserRole })}
                                className="text-xs bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-600 font-medium py-1.5 px-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                Promote to Moderator
                              </button>
                            )}
                            {u.role === 'moderator' && (
                              <>
                                <button
                                  disabled={isPending}
                                  onClick={() => updateRole({ id: u.id, role: 'admin' as UserRole })}
                                  className="text-xs bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-600 font-medium py-1.5 px-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Promote to Admin
                                </button>
                                <button
                                  disabled={isPending}
                                  onClick={() => updateRole({ id: u.id, role: 'contributor' as UserRole })}
                                  className="text-xs bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium py-1.5 px-3 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  Demote
                                </button>
                              </>
                            )}
                            {u.role === 'admin' && (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
