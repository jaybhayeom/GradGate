import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import 'katex/dist/katex.min.css';
import { GlobalErrorBoundary } from '../components/common/GlobalErrorBoundary';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
