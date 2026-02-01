import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    uid: string;
    email: string;
    fullName: string;
    photoURL?: string;
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    photoURL: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>("User", UserSchema);
