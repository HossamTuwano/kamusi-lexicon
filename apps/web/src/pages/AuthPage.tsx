import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function AuthPage() {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') {
        await login(username, password);
      } else {
        await register(username, email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Hitilafu');
    }
  }

  return (
    <section className="stack">
      <div className="hero" style={{ paddingBottom: '1rem' }}>
        <h1>{mode === 'login' ? 'Ingia' : 'Jisajili'}</h1>
        <p>Changia Kamusi ya Kiswahili kama mchangiaji.</p>
      </div>

      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Jina la mtumiaji
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        {mode === 'register' && (
          <label>
            Barua pepe
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
        )}
        <label>
          Nenosiri
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button className="btn" type="submit">
          {mode === 'login' ? 'Ingia' : 'Unda akaunti'}
        </button>
        <button
          type="button"
          className="ghost"
          onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        >
          {mode === 'login' ? 'Je, huna akaunti? Jisajili' : 'Tayari una akaunti? Ingia'}
        </button>
      </form>
    </section>
  );
}
