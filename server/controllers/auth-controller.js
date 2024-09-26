import {User} from '../models/user-model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { configDotenv } from 'dotenv';
import { verification } from '../middleware/verification.js';

configDotenv();

export const signUp = async (req, res) => {
    const { fullname, username, email, password } = req.body;

    // Check if all fields are provided
    if (!fullname || !username || !email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    // Validate data types
    if (typeof fullname !== 'string' || typeof username !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ message: 'Invalid data type' });
    }

    // Validate password length and complexity
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    try {
        // Check if the user already exists
        const existingUserByEmail = await User.findOne({ email });
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByEmail || existingUserByUsername) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user in the database
        const result = await User.create({
             fullname,
              username,
              email,
              password: hashedPassword,
              isEmailVerified: false,
              verificationCode: null, 
            });

        // Generate a JWT token
        const token = jwt.sign({ email: result.email, id: result._id }, process.env.JWT_SECRET_KEY);

        const verificationRes = await verification(req,res);

        // Return success message
        if(verificationRes === 200) {
        return res.status(201).json({ message: 'User created', token: token });
        }
        res.status(500).json({ message: 'Something went wrong' });
    } catch (error) {
        // Log the error for server debugging
        // Send a generic error message to the client
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

// login
export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }

    if(typeof email !== 'string' || typeof password !== 'string') { 
        return res.status(400).json({ message: 'Invalid data type' });
    }  

    if(!email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
        return res.status(400).json({ message: 'Invalid email' });
    }

    try {
        const user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({ message: 'User does not exist' });
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        if (user.isEmailVerified == false) {
            const verificationRes = await verification(req, res);
            // Return success message
            if (verificationRes === 200) {
                return res.status(403).json({ message: 'verify your email' });
            }
        }
        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET_KEY,{expiresIn: '90d'});
        return res.status(200).json({ message: 'Login successful', token: token });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}

// verify 
export const verify = async (req, res) => {

    const { email, verificationCode } = req.body;

    const verificationCodeInt = parseInt(verificationCode);

    if (!email || !verificationCodeInt) {
        return res.status(400).json({ message: 'Please enter all fields' });
    }    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }    
        if (user.verificationCode !== verificationCodeInt) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }    
        await User.updateOne({ email }, { isEmailVerified: true,verificationCode: null });

        const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET_KEY);

        return res.status(200).json({ message: 'Email verified successfully',token: token });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }

}

// cheack is valid username
export const checkUsername = async (req, res) => {
    const { username } = req.body;
    console.log(username)
    try {
        if(!username) return res.status(400).json({ message: 'Please enter all fields' });
        const existingUserByUsername = await User.findOne({ username });
        if (existingUserByUsername) {
            return res.status(400).json({ message: 'Username already exists' });
        }
        return res.status(200).json({ message: 'Username available' });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

// verify me
// export const verifyMe = async (req, res) => {
//     const token = req.cookies.u_token;
//     if (!token) {
//         return res.status(401).json({ authenticate: false});
//     }
//     try {
//         const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
//         if (!verified) {
//             return res.status(401).json({ authenticate: false});
//         }
//         const user = await User.findOne({ email: verified.email });
//         if (!user) {
//             return res.status(401).json({ authenticate:false });
//         }
//         return res.status(200).json({ authenticate: true });
//     } catch (error) {
//         return res.status(500).json({ message: 'Something went wrong' , authenticate: false});
//     }
// }