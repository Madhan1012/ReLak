import { Settings, UserCircle } from 'lucide-react';

export default function Navbar({ serverStatus }) {
  return (
    <nav className="nav">
      <div className="nav-inner">
        <span className="nav-logo">ReLak</span>

        <div className="nav-right">
          {serverStatus === 'warming' && (
            <span className="nav-status warming">◉ System Warming Up...</span>
          )}
          {serverStatus === 'online' && (
            <span className="nav-status online">● Engine Online</span>
          )}
          <button className="nav-btn"><Settings size={18} /></button>
          <button className="nav-btn"><UserCircle size={18} /></button>
        </div>
      </div>
    </nav>
  );
}
