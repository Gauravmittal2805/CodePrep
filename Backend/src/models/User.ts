import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    uid: string;
    email: string;
    fullName: string;
    photoURL?: string;
    lastForcedLogout?: Date;
    isBlocked?: boolean;
    blockReason?: string;
    role: 'admin' | 'moderator' | 'user';
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    photoURL: { type: String },
    lastForcedLogout: { type: Date },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String },
    role: { type: String, enum: ['admin', 'moderator', 'user'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
