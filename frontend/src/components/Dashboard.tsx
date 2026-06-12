import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

interface DashboardProps {
  user: { id: string; username: string; totalCredits: number };
  onLogout: () => void;
  onSelectPost: (postId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout, onSelectPost }) => {
  const [posts, setPosts] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  // Fetch the real-time public thread feed
  const fetchPosts = async () => {
    try {
      const data = await apiRequest('/forum/posts');
      setPosts(data);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiRequest('/forum/posts', {
        method: 'POST',
        body: JSON.stringify({ title, body }),
      });
      setTitle('');
      setBody('');
      fetchPosts(); // Refresh active feed instantly
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      {/* Top Profile Strip */}
      <div className="flex justify-between items-center bg-gray-800 text-white p-4 rounded-lg shadow-md mb-8">
        <div>
          <h2 className="text-xl font-bold">Welcome, {user.username}!</h2>
          <p className="text-sm text-yellow-400 font-medium">⭐ Your Thread Earnings: {user.totalCredits} Credits</p>
        </div>
        <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-semibold text-sm transition">
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Create Post Form */}
        <div className="md:col-span-1 bg-white p-5 rounded-lg shadow border border-gray-200 h-fit">
          <h3 className="text-lg font-bold mb-4 text-gray-800">Start a Discussion</h3>
          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          <form onSubmit={handleCreatePost} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase">Topic Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full mt-1 p-2 border rounded text-sm" placeholder="What's on your mind?" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase">Context / Body</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)} required rows={4} className="w-full mt-1 p-2 border rounded text-sm" placeholder="Provide details..."></textarea>
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded font-semibold text-sm transition">
              Publish Thread
            </button>
          </form>
        </div>

        {/* Right Column: Public Feed Display */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Active Discussions</h3>
          {posts.length === 0 ? (
            <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded border text-center">No threads have been created yet. Be the first!</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} onClick={() => onSelectPost(post._id)} className="bg-white p-5 rounded-lg shadow border border-gray-200 hover:border-blue-400 transition cursor-pointer">
                <h4 className="text-lg font-bold text-blue-600 hover:underline">{post.title}</h4>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.body}</p>
                <div className="flex justify-between items-center mt-4 pt-3 border-t text-xs text-gray-500">
                  <span>By <strong className="text-gray-700">{post.author?.username || 'Anonymous'}</strong></span>
                  <span className="bg-gray-100 px-2 py-1 rounded">OP Balance: <strong className="text-gray-800">{post.author?.totalCredits || 0} pts</strong></span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};