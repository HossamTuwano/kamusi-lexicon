import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export function Shell() {
  const { user, logout } = useAuth();

  return (
    <div className="shell">
      <header className="topbar">
        <Link to="/" className="brand">
          Kamusi<span>.</span>
        </Link>
        <nav className="nav-links">
          <Link to="/">Tafuta</Link>
          <Link to="/contribute">Changia</Link>
          {user ? (
            <>
              <span className="muted">{user.username}</span>
              <button type="button" className="ghost" onClick={logout}>
                Toka
              </button>
            </>
          ) : (
            <Link to="/auth">Ingia</Link>
          )}
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
