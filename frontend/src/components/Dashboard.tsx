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
      fetchPosts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(/[_\s]/)
      .map((p) => p[0]?.toUpperCase() ?? '')
      .slice(0, 2)
      .join('');

  const avatarColors = [
    { bg: '#EAF3DE', color: '#3B6D11' },
    { bg: '#E6F1FB', color: '#185FA5' },
    { bg: '#FAEEDA', color: '#854F0B' },
    { bg: '#FBEAF0', color: '#993556' },
    { bg: '#E1F5EE', color: '#0F6E56' },
  ];

  const getAvatarColor = (name: string) =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

  return (
    <div className="dash-page">

      {/* Top bar */}
      <div className="dash-topbar">
        <div className="dash-topbar-left">
          <div
            className="dash-avatar"
            style={{
              background: getAvatarColor(user.username).bg,
              color: getAvatarColor(user.username).color,
            }}
          >
            {getInitials(user.username)}
          </div>
          <div>
            <div className="dash-username">{user.username}</div>
            <div className="dash-credits-row">
              <span className="dash-credit-badge">{user.totalCredits} credits</span>
              <span className="dash-credits-label">thread earnings</span>
            </div>
          </div>
        </div>
        <button className="dash-logout-btn" onClick={onLogout}>
          Sign out
        </button>
      </div>

      {/* Main layout */}
      <div className="dash-layout">

        {/* Left: New thread form */}
        <div className="dash-panel">
          <div className="dash-panel-title">New thread</div>

          {error && <p className="dash-error-msg">{error}</p>}

          <form onSubmit={handleCreatePost}>
            <div className="dash-field">
              <label className="dash-field-label">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="What's on your mind?"
                className="dash-input"
              />
            </div>
            <div className="dash-field">
              <label className="dash-field-label">Details</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={5}
                placeholder="Add context, background, or questions..."
                className="dash-input dash-textarea"
              />
            </div>

            <hr className="dash-divider" />

            <button type="submit" className="dash-publish-btn">
              Publish thread
            </button>
          </form>
        </div>

        {/* Right: Feed */}
        <div className="dash-feed-col">
          <div className="dash-feed-header">
            <span className="dash-feed-title">Active discussions</span>
            <span className="dash-feed-count">
              {posts.length} {posts.length === 1 ? 'thread' : 'threads'}
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="dash-empty-state">
              No threads yet — start the first discussion.
            </div>
          ) : (
            posts.map((post) => {
              const authorName = post.author?.username || 'anonymous';
              const ac = getAvatarColor(authorName);
              return (
                <div
                  key={post._id}
                  className="dash-post-card"
                  onClick={() => onSelectPost(post._id)}
                >
                  <div className="dash-post-title">{post.title}</div>
                  <div className="dash-post-body">{post.body}</div>
                  <div className="dash-post-meta">
                    <div className="dash-post-author">
                      <div
                        className="dash-mini-avatar"
                        style={{ background: ac.bg, color: ac.color }}
                      >
                        {getInitials(authorName)}
                      </div>
                      <span className="dash-author-name">{authorName}</span>
                    </div>
                    <span className="dash-pts-tag">
                      {post.author?.totalCredits ?? 0} pts
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
