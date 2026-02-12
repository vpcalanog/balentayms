import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://jlyrxkjakblqzeppreod.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseXJ4a2pha2JscXplcHByZW9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4ODc4MDMsImV4cCI6MjA4NjQ2MzgwM30.r53vJt1-UFhLEhqKUyvPOVUjnfKrPjLAYRr5ZH8CGZ8')

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </React.StrictMode>
);
