import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/auth-context'
import { authenticatedFetch } from '../lib/api'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const isFormValid = username.trim() && password.trim()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
      setError('Username and password are required')
      return
    }

    setError('')
    setLoading(true)
    try {
      const data = await authenticatedFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      const token = data.accessToken || data.access_token
      const userRole = data.user?.role || 'contributor'
      
      if (token) {
        login(token, userRole)
        navigate('/', { replace: true })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Login failed'
      setError(errorMsg)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Kamusi Admin</h2>
          <p className="text-slate-500 mt-2">Please sign in to your account</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
              <p className="text-red-600 text-xs mt-1">Default: admin / admin123</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={username} 
              onChange={e => setUsername(e.target.value)}
              placeholder="admin"
              disabled={loading}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={password} 
              onChange={e => setPassword(e.target.value)}
              placeholder="admin123"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          <button 
            className={`w-full font-bold py-2 px-4 rounded-lg transition-colors duration-200 shadow-sm ${
              isFormValid && !loading
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
            type="submit"
            disabled={!isFormValid || loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
