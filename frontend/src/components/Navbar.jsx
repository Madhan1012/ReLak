import { useNavigate } from 'react-router-dom';

export default function Navbar({ serverStatus }) {
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
        </div>
      </div>
    </nav>
  );
}
