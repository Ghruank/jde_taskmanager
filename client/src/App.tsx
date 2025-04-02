import './App.css';
import Dashboard from './components/dashboard';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const handleLogout = () => {
    localStorage.removeItem('guestMode');
    localStorage.removeItem('guestTasks');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.reload(); // Reload to reset the app state
  };

  return (
    <div className="App" style={{ height: '100vh', width: '100%' }}>
      <ThemeProvider>
        <Dashboard onLogout={handleLogout} /> {/* Pass handleLogout to Dashboard */}
      </ThemeProvider>
    </div>
  );
}

export default App;
