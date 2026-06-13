import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

interface PostDetailsProps {
  postId: string;
  currentUserId: string;
  onBack: () => void;
}

export const PostDetails: React.FC<PostDetailsProps> = ({ postId, currentUserId }) => {
  const [data, setData] = useState<any>(null);
  const [commentInput, setCommentInput] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');

  const loadPostData = async () => {
    try {
      const res = await apiRequest(`/forum/posts/${postId}`);
      setData(res);
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    loadPostData();
  }, [postId]);

  const handleAddRootComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try {
      await apiRequest('/forum/comments', {
        method: 'POST',
        body: JSON.stringify({ postId, body: commentInput }),
      });
      setCommentInput('');
      loadPostData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddReply = async (parentCommentId: string) => {
    if (!replyInput.trim()) return;
    try {
      await apiRequest('/forum/comments', {
        method: 'POST',
        body: JSON.stringify({ postId, body: replyInput, parentCommentId }),
      });
      setReplyInput('');
      setReplyTargetId(null);
      loadPostData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Delete this comment? This will claw back credits from the OP.')) return;
    try {
      await apiRequest(`/forum/comments/${commentId}`, { method: 'DELETE' });
      loadPostData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!data) return <div className="pd-loading">Loading thread...</div>;

  const renderCommentTree = (parentId: string | null = null) => {
    const nodes = data.comments.filter((c: any) => c.parentCommentId === parentId);

    return nodes.map((comment: any) => (
      <div key={comment._id} className="pd-comment-node">

        {/* Meta row */}
        <div className="pd-comment-meta">
          <div className="pd-comment-meta-left">
            <span className="pd-comment-author">
              {comment.author?.username || 'Anonymous'}
            </span>
            <span className="pd-depth-badge">d{comment.depth}</span>
          </div>
          {comment.author?._id === currentUserId && !comment.isDeleted && (
            <button className="pd-delete-btn" onClick={() => handleDeleteComment(comment._id)}>
              Delete
            </button>
          )}
        </div>

        {/* Body */}
        <p className={`pd-comment-body${comment.isDeleted ? ' deleted' : ''}`}>
          {comment.body}
        </p>

        {/* Reply controls */}
        {!comment.isDeleted && (
          replyTargetId === comment._id ? (
            <div className="pd-reply-form">
              <input
                type="text"
                value={replyInput}
                onChange={(e) => setReplyInput(e.target.value)}
                placeholder="Write a reply..."
                className="pd-reply-input"
                autoFocus
              />
              <button className="pd-reply-submit" onClick={() => handleAddReply(comment._id)}>
                Submit
              </button>
              <button className="pd-reply-cancel" onClick={() => setReplyTargetId(null)}>
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="pd-reply-btn"
              onClick={() => { setReplyTargetId(comment._id); setReplyInput(''); }}
            >
              ↳ Reply
            </button>
          )
        )}

        {/* Recursive subtree */}
        {renderCommentTree(comment._id)}
      </div>
    ));
  };

  return (
    <div className="pd-page">

      {/* Post */}
      <div className="pd-post-card">
        <h2 className="pd-post-title">{data.post.title}</h2>
        <p className="pd-post-author">Started by {data.post.author?.username || 'Anonymous'}</p>
        <p className="pd-post-body">{data.post.body}</p>
      </div>

      {/* Comment input */}
      <div className="pd-comment-box">
        <div className="pd-comment-box-title">Add a comment</div>
        <form onSubmit={handleAddRootComment} className="pd-comment-form">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Share your thoughts..."
            required
            className="pd-comment-input"
          />
          <button type="submit" className="pd-comment-submit">
            Comment
          </button>
        </form>
      </div>

      {/* Responses */}
      <div className="pd-responses-panel">
        <h3 className="pd-responses-title">
          {data.comments.length} {data.comments.length === 1 ? 'response' : 'responses'}
        </h3>
        {data.comments.length === 0 ? (
          <p className="pd-empty">No replies yet — be the first.</p>
        ) : (
          renderCommentTree(null)
        )}
      </div>

    </div>
  );
};