import { Schema, model } from 'mongoose';

const commentSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: 'Post', required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  parentCommentId: { type: Schema.Types.ObjectId, ref: 'Comment', default: null }, // Null means direct reply to the main post
  depth: { type: Number, default: 1 }, // Used to calculate AP credits
  isDeleted: { type: Boolean, default: false } // Production style soft-delete flag
}, { timestamps: true });

export const Comment = model('Comment', commentSchema);