import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { WordProvider } from './context/WordContext';
import Sidebar from './components/Sidebar/Sidebar';
import AppRoutes from './routes';
import { useUser } from './context/UserContext';
import './App.css';

const AppContent = () => {
  const { user } = useUser();
  
  return (
    <div className="app">
      {user && <Sidebar />}
      <main className={`main-content ${user ? 'with-sidebar' : ''}`}>
        <AppRoutes />
      </main>
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <WordProvider>
        <Router>
          <AppContent />
        </Router>
      </WordProvider>
    </UserProvider>
  );
}

export default App; 