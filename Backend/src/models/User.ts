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
    bio?: string;
    college?: string;
    company?: string;
    location?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
    codingRole?: string;
    techStack?: string[];
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
    bio: { type: String },
    college: { type: String },
    company: { type: String },
    location: { type: String },
    github: { type: String },
    linkedin: { type: String },
    portfolio: { type: String },
    codingRole: { type: String },
    techStack: { type: [String] },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
