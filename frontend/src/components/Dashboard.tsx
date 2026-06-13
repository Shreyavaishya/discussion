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

  // Cycle through a few subtle avatar background colors based on name
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
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topbar}>
        <div style={styles.topbarLeft}>
          <div
            style={{
              ...styles.avatar,
              background: getAvatarColor(user.username).bg,
              color: getAvatarColor(user.username).color,
            }}
          >
            {getInitials(user.username)}
          </div>
          <div>
            <div style={styles.username}>{user.username}</div>
            <div style={styles.creditsRow}>
              <span style={styles.creditBadge}>{user.totalCredits} credits</span>
              <span style={styles.creditsLabel}>thread earnings</span>
            </div>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={onLogout}>
          Sign out
        </button>
      </div>

      {/* Main layout */}
      <div style={styles.layout}>
        {/* Left: New thread form */}
        <div style={styles.panel}>
          <div style={styles.panelTitle}>New thread</div>

          {error && <p style={styles.errorMsg}>{error}</p>}

          <form onSubmit={handleCreatePost}>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="What's on your mind?"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.fieldLabel}>Details</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                rows={5}
                placeholder="Add context, background, or questions..."
                style={{ ...styles.input, resize: 'none', lineHeight: '1.55' }}
              />
            </div>

            <div style={styles.divider} />

            <button type="submit" style={styles.publishBtn}>
              Publish thread
            </button>
          </form>
        </div>

        {/* Right: Feed */}
        <div style={{ minWidth: 0 }}>
          <div style={styles.feedHeader}>
            <span style={styles.feedTitle}>Active discussions</span>
            <span style={styles.feedCount}>
              {posts.length} {posts.length === 1 ? 'thread' : 'threads'}
            </span>
          </div>

          {posts.length === 0 ? (
            <div style={styles.emptyState}>
              No threads yet — start the first discussion.
            </div>
          ) : (
            posts.map((post) => {
              const authorName = post.author?.username || 'anonymous';
              const ac = getAvatarColor(authorName);
              return (
                <div
                  key={post._id}
                  style={styles.postCard}
                  onClick={() => onSelectPost(post._id)}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.borderColor = '#B5D4F4')
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.borderColor =
                      'rgba(0,0,0,0.12)')
                  }
                >
                  <div style={styles.postTitle}>{post.title}</div>
                  <div style={styles.postBody}>{post.body}</div>
                  <div style={styles.postMeta}>
                    <div style={styles.postAuthor}>
                      <div
                        style={{
                          ...styles.miniAvatar,
                          background: ac.bg,
                          color: ac.color,
                        }}
                      >
                        {getInitials(authorName)}
                      </div>
                      <span style={styles.authorName}>{authorName}</span>
                    </div>
                    <span style={styles.ptsTag}>
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

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  page: {
    width: '100%',
    maxWidth: '100%',
    padding: '2rem 2.5rem',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxSizing: 'border-box' as const,
  },

  // Top bar
  topbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 18px',
    background: '#ffffff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 12,
    marginBottom: '1.5rem',
  },
  topbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    fontSize: 14,
    flexShrink: 0,
  },
  username: {
    fontSize: 15,
    fontWeight: 500,
    color: '#111',
    marginBottom: 2,
  },
  creditsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  creditBadge: {
    fontSize: 11,
    fontWeight: 500,
    background: '#FAEEDA',
    color: '#854F0B',
    padding: '2px 8px',
    borderRadius: 20,
  },
  creditsLabel: {
    fontSize: 12,
    color: '#888',
  },
  logoutBtn: {
    fontSize: 13,
    color: '#555',
    background: 'none',
    border: '0.5px solid rgba(0,0,0,0.2)',
    padding: '7px 14px',
    borderRadius: 8,
    cursor: 'pointer',
  },

  // Layout
  layout: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '1.5rem',
    alignItems: 'start',
  },

  // Left panel
  panel: {
    background: '#ffffff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: '1.25rem',
  },
  panelTitle: {
    fontSize: 12,
    fontWeight: 500,
    color: '#888',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.07em',
    marginBottom: '1rem',
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    display: 'block',
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    fontSize: 13,
    background: '#f7f7f5',
    border: '0.5px solid rgba(0,0,0,0.15)',
    borderRadius: 8,
    color: '#111',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box' as const,
  },
  divider: {
    borderTop: '0.5px solid rgba(0,0,0,0.1)',
    margin: '1rem 0',
  },
  publishBtn: {
    width: '100%',
    padding: '9px',
    fontSize: 13,
    fontWeight: 500,
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  errorMsg: {
    fontSize: 12,
    color: '#c0392b',
    marginBottom: 10,
  },

  // Feed
  feedHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  feedTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#111',
  },
  feedCount: {
    fontSize: 12,
    color: '#888',
  },

  // Post cards
  postCard: {
    background: '#ffffff',
    border: '0.5px solid rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: '1rem 1.25rem',
    marginBottom: 10,
    cursor: 'pointer',
    transition: 'border-color 0.15s',
  },
  postTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: '#111',
    marginBottom: 5,
  },
  postBody: {
    fontSize: 13,
    color: '#555',
    lineHeight: 1.55,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
  },
  postMeta: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTop: '0.5px solid rgba(0,0,0,0.08)',
  },
  postAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 10,
    fontWeight: 500,
    flexShrink: 0,
  },
  authorName: {
    fontSize: 12,
    color: '#666',
  },
  ptsTag: {
    fontSize: 11,
    color: '#888',
    background: '#f3f3f1',
    padding: '3px 9px',
    borderRadius: 20,
  },

  // Empty state
  emptyState: {
    textAlign: 'center' as const,
    padding: '2.5rem 1rem',
    color: '#888',
    fontSize: 13,
    border: '0.5px dashed rgba(0,0,0,0.15)',
    borderRadius: 12,
  },
};