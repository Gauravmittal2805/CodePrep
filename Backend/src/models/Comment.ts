import mongoose, { Schema, Document } from "mongoose";

export interface IComment extends Document {
    problemIdentifier: string;
    uid: string;
    userName: string;
    userPhoto?: string;
    content: string;
    upvotes: number;
    parentId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
    problemIdentifier: { type: String, required: true, index: true },
    uid: { type: String, required: true },
    userName: { type: String, required: true },
    userPhoto: { type: String },
    content: { type: String, required: true },
    upvotes: { type: Number, default: 0 },
    parentId: { type: String, index: true },
}, {
    timestamps: true
});

export default mongoose.model<IComment>("Comment", CommentSchema);
