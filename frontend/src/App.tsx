import { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { PostDetails } from './components/PostDetails';

function App() {
  const [user, setUser] = useState<any>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if a user is already logged in on page refresh
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
    return <div className="text-center mt-20 text-gray-500 font-medium">Waking up interface...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans antialiased">
      {/* Universal Sticky Header Branding */}
      <header className="bg-white border-b border-gray-200 py-4 shadow-sm mb-6">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl font-extrabold tracking-tight text-black-800">
   Full Stack Dev Forum
</h1>
      </div>
      </header>

      {/* Main App Workflow View Routing */}
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
    </div>
  );
}

export default App;