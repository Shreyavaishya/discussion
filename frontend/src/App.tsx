import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { PostDetails } from './components/PostDetails';

function App() {
  const [user, setUser] = useState<any>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (loggedInUser: any, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSelectedPostId(null);
  };

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <div className="app-root">

      {/* Navbar */}
      <header className="app-navbar">

        {/* Left: icon + name */}
        <div className="app-navbar-brand" onClick={() => setSelectedPostId(null)}>
          <div className="app-navbar-icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 3h10M2 7h6M2 11h8" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </div>
          <span className="app-navbar-name">Full Stack Dev Forum</span>
        </div>

        {/* Right: back button + username pill */}
        <div className="app-navbar-right">
          {selectedPostId && (
            <button className="app-back-btn" onClick={() => setSelectedPostId(null)}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M8 2L4 6l4 4" stroke="#555" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to feed
            </button>
          )}
          {user && (
            <div className="app-user-pill">{user.username}</div>
          )}
        </div>
      </header>

      {/* Page content */}
      <main>
        {!user ? (
          <Auth onAuthSuccess={handleAuthSuccess} />
        ) : selectedPostId ? (
          <PostDetails
            postId={selectedPostId}
            currentUserId={user.id}
            onBack={() => setSelectedPostId(null)}
          />
        ) : (
          <Dashboard
            user={user}
            onLogout={handleLogout}
            onSelectPost={(id) => setSelectedPostId(id)}
          />
        )}
      </main>
    </div>
  );
}

export default App;