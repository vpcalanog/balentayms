import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://tymoeuinlkohesghdjpk.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5bW9ldWlubGtvaGVzZ2hkanBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDcyMjI2MDgsImV4cCI6MjAyMjc5ODYwOH0.3ijpdLT5pWpNhinVHuIHmW_HKfM5mFiyH6uEPYpk1Sc')

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>
);
