import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';
import { User } from '../models/user-model.js';

configDotenv();

export const checkAuth = async (req, res, next) => {
    try {
        const token = req.cookies.u_token;
        if (!token) {
            return res.status(401).json({ authenticate: false, message: 'No token provided' });
        }

        let verified;
        try {
            verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ authenticate: false, message: 'Token expired' });
            }
            return res.status(401).json({ authenticate: false, message: 'Invalid token' });
        }

        const user = await User.findOne({ email: verified.email, _id: verified.id });
        if (!user || !user.isEmailVerified) {
            res.cookie('u_token', '', {
                maxAge: 0,
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'None'
            });
            return res.status(401).json({ authenticate: false, message: 'Unauthorized' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};
