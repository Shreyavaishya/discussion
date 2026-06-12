import React, { useState, useEffect } from 'react';
import { apiRequest } from '../utils/api';

interface PostDetailsProps {
  postId: string;
  currentUserId: string;
  onBack: () => void;
}

export const PostDetails: React.FC<PostDetailsProps> = ({ postId, currentUserId, onBack }) => {
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
    if (!confirm('Are you sure you want to delete this reply? This will claw back credits from the OP.')) return;
    try {
      await apiRequest(`/forum/comments/${commentId}`, { method: 'DELETE' });
      loadPostData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (!data) return <div className="text-center mt-20 font-medium">Loading Thread Node Context...</div>;

  // Structural recursive helper to render comments matching parent tree chains
  const renderCommentTree = (parentId: string | null = null) => {
    const layerNodes = data.comments.filter((c: any) => c.parentCommentId === parentId);

    return layerNodes.map((comment: any) => (
      <div key={comment._id} className="mt-4 border-l-2 border-gray-200 pl-4 bg-gray-50/50 p-3 rounded-r-md">
        <div className="flex justify-between items-start text-xs text-gray-500">
          <span>
            Posted by <strong className="text-gray-700">{comment.author?.username || 'Anonymous'}</strong> 
            <span className="ml-2 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-mono">Depth {comment.depth}</span>
          </span>
          {comment.author?._id === currentUserId && !comment.isDeleted && (
            <button onClick={() => handleDeleteComment(comment._id)} className="text-red-500 hover:underline">
              Delete
            </button>
          )}
        </div>
        <p className={`text-sm mt-1 text-gray-800 ${comment.isDeleted ? 'italic text-gray-400 bg-gray-100 p-1 rounded' : ''}`}>
          {comment.body}
        </p>

        {/* Reply Triggers */}
        {!comment.isDeleted && (
          <div className="mt-2">
            {replyTargetId === comment._id ? (
              <div className="mt-2 flex gap-2">
                <input type="text" value={replyInput} onChange={(e) => setReplyInput(e.target.value)} className="flex-1 p-1.5 border rounded text-xs" placeholder="Write a targeted reply..." autoFocus />
                <button onClick={() => handleAddReply(comment._id)} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold">Submit</button>
                <button onClick={() => setReplyTargetId(null)} className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs">Cancel</button>
              </div>
            ) : (
              <button onClick={() => { setReplyTargetId(comment._id); setReplyInput(''); }} className="text-xs text-blue-600 font-semibold hover:underline">
                ↳ Reply
              </button>
            )}
          </div>
        )}

        {/* Recursive Sub-tree Traversal */}
        {renderCommentTree(comment._id)}
      </div>
    ));
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 px-4 mb-20">
      <button onClick={onBack} className="text-sm font-semibold text-blue-600 hover:underline mb-4">← Back to Discussions</button>
      
      {/* Thread Title Node */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{data.post.title}</h2>
        <p className="text-gray-500 text-xs mt-1">Started by {data.post.author?.username || 'Anonymous'}</p>
        <p className="text-gray-700 mt-4 whitespace-pre-wrap text-base border-t pt-4">{data.post.body}</p>
      </div>

      {/* Root Level Submission Box */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
        <h3 className="text-sm font-bold text-gray-800 mb-2">Join the Conversation</h3>
        <form onSubmit={handleAddRootComment} className="flex gap-2">
          <input type="text" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Type your comment..." required className="flex-1 p-2 border rounded text-sm" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition">Comment</button>
        </form>
      </div>

      {/* Render the complete hierarchical tree */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-2">Responses</h3>
        {data.comments.length === 0 ? (
          <p className="text-sm text-gray-500 italic py-4 text-center">No replies yet.</p>
        ) : (
          renderCommentTree(null)
        )}
      </div>
    </div>
  );
};