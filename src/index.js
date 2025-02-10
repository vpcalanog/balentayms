import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://vjuzvkupjfdakzkffpaz.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZqdXp2a3VwamZkYWt6a2ZmcGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczNTQ5MjQsImV4cCI6MjA1MjkzMDkyNH0.kCHw7HPdejhNnvo-fmJG3O1GurRES65SPsFl25MhrOo')

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>
);
