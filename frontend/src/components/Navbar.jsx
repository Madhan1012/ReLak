import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ serverStatus }) {
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <nav className="nav">
      <div className="nav-inner">
        <span
          className="nav-logo"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer', userSelect: 'none' }}
          title="Back to home"
        >
          ReLak
        </span>
        <div className="nav-right">
          {serverStatus === 'warming' && (
            <span className="nav-status warming">◉ System Warming Up...</span>
          )}
          {serverStatus === 'online' && (
            <span className="nav-status online">● Engine Online</span>
          )}
          <button className="theme-toggle" onClick={toggle} aria-label="Toggle dark mode">
            {dark ? <Sun size={13} /> : <Moon size={13} />}
            {dark ? 'Light' : 'Dark'}
          </button>
        </div>
      </div>
    </nav>
  );
}
