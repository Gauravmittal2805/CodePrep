import { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import User from "../models/User";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

(() => {
    const candidates = [
        path.resolve(process.cwd(), '.env'),
        path.resolve(process.cwd(), 'Backend', '.env'),
        path.resolve(__dirname, '..', '.env'),
        path.resolve(__dirname, '..', '..', '.env')
    ];

    const envPath = candidates.find((p) => fs.existsSync(p));
    if (envPath) {
        dotenv.config({ path: envPath });
    } else {
        dotenv.config();
    }
})();

let firebaseInitError: string | null = null;

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
    try {
        const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

        if (serviceAccountJson) {
            const parsed = JSON.parse(serviceAccountJson);
            admin.initializeApp({
                credential: admin.credential.cert(parsed)
            });
        } else if (serviceAccountPath) {
            if (!fs.existsSync(serviceAccountPath)) {
                throw new Error(`Firebase service account file not found at: ${serviceAccountPath}`);
            }

            const raw = fs.readFileSync(serviceAccountPath, 'utf8');
            const parsed = JSON.parse(raw);
            admin.initializeApp({
                credential: admin.credential.cert(parsed)
            });
        } else {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }
    } catch (err) {
        firebaseInitError = err instanceof Error ? err.message : String(err);
        console.error('Firebase Admin initialization error:', err);
    }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (firebaseInitError) {
            return res.status(500).json({
                success: false,
                error: 'Firebase Admin is not configured',
                details: process.env.NODE_ENV === 'development' ? firebaseInitError : undefined
            });
        }

        // Get token from Authorization header
        const authHeader = req.header('Authorization');

        if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Request', req.method, req.originalUrl, 'hasAuthHeader=', !!authHeader);
        }

        // Check if no token
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'No token, authorization denied'
            });
        }

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.substring(7);

        // Verify Firebase token (check if revoked)
        const decodedToken = await admin.auth().verifyIdToken(token, true);

        // Secondary check: MongoDB lastForcedLogout
        const userDoc = await User.findOne({ uid: decodedToken.uid });
        if (userDoc?.lastForcedLogout) {
            const logoutTime = new Date(userDoc.lastForcedLogout).getTime() / 1000;
            // If token was issued BEFORE the last forced logout, reject it
            if (decodedToken.iat < logoutTime) {
                return res.status(401).json({
                    success: false,
                    error: 'Session has been invalidated'
                });
            }
        }

        if (userDoc?.isBlocked) {
            return res.status(403).json({
                success: false,
                error: 'Your account has been blocked',
                reason: userDoc.blockReason
            });
        }

        req.user = decodedToken;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        res.status(401).json({
            success: false,
            error: 'Token is not valid'
        });
    }
};
