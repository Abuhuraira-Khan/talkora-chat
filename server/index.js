import { server, app } from './socket/socket.js';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { configDotenv } from 'dotenv';
// all routes
import authRoute from './routes/auth.js';
import usersRoute from './routes/users.js';
import chatRoute from './routes/chat.js';
import messageRoute from './routes/message.js';
import storiesRoute from './routes/stories.js'
// middleware
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { checkAuth } from './middleware/checkAuth.js';

configDotenv();
const port = process.env.PORT || 5000;

// MongoDB connection
(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (err) {
        console.error("Error connecting to database:", err);
    }
})();

// Middleware
app.use(express.json({ limit: '70mb', extended: true }));
app.use(express.urlencoded({ limit: '70mb', extended: true }));
app.use(cookieParser());
app.use(helmet()); // Enable Helmet for default security headers

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 1*10*1000, // 10 seconds
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Redirect HTTP to HTTPS (if not behind a proxy handling SSL)
// app.use((req, res, next) => {
//     if (req.secure) {
//         return next();
//     }
//     res.redirect(`http://${req.headers.host}${req.url}`);
// });

// Routes
app.use('/auth', authRoute);
app.use('/users', checkAuth,usersRoute);
app.use('/chat',checkAuth,chatRoute);
app.use('/message',checkAuth,messageRoute);
app.use('/stories',checkAuth,storiesRoute);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong' });
});

// Start server
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

