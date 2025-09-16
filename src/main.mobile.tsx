import { storage, secrets, ai } from './platform/runtime';
import App from './renderer/App';
import { createRoot } from 'react-dom/client';

async function bootstrap() {
  await storage.ensureDir('default-pile');
  const container = document.getElementById('root');
  if (!container) throw new Error('Missing root element');
  const root = createRoot(container);
  root.render(<App />);
}

bootstrap().catch((e) => {
  console.error('Fatal init error', e);
});
