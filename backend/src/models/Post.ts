import { Schema, model } from 'mongoose';

const postSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true } // Points to the thread creator (OP)
}, { timestamps: true });

export const Post = model('Post', postSchema);