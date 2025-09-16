import { createRoot } from 'react-dom/client';
import App from './App';
import { MemoryRouter as Router } from 'react-router-dom';
const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

const isMac = typeof window !== 'undefined' && (window as any).electron?.isMac;
const wrapperStyle = {
  background: isMac ? 'var(--bg-translucent)' : 'var(--bg)',
}

root.render(
  <Router>
    <div style={wrapperStyle}>
      <App />
    </div>
  </Router>
);
