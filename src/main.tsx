import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Erros fora do React (promises sem catch, scripts de terceiros) vão para o console
// com contexto, em vez de sumirem silenciosamente.
window.addEventListener('error', (evento) => {
  console.error('[Fast-Track Cantina] erro não tratado:', evento.error ?? evento.message);
});
window.addEventListener('unhandledrejection', (evento) => {
  console.error('[Fast-Track Cantina] promise rejeitada sem tratamento:', evento.reason);
});

const elementoRaiz = document.getElementById('root');

if (!elementoRaiz) {
  document.body.innerHTML =
    '<p style="font-family:sans-serif;padding:24px">Não foi possível iniciar a Fast-Track Cantina: elemento #root não encontrado no index.html.</p>';
  throw new Error('Elemento #root não encontrado no index.html.');
}

createRoot(elementoRaiz).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
