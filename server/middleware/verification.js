import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { User } from '../models/user-model.js';

const generateVerificationCode = () => {
    return crypto.randomInt(100000, 999999); // Generates a 6-digit code
};

const sendVerificationCode = async (email, code,name) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // You can use other providers as well
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });

    const htmlContent = `
  <html>
  <head>
    <style>
    body {
        font-size: 20px;
    }
      .container {
        font-family: Arial, sans-serif;
        padding: 20px;
        background-color: #f4f4f4;
        border-radius: 5px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        max-width: 600px;
        margin: auto;
      }
      .header {
        background: linear-gradient(to right, #bfdbfe, #d8b4fe );
        color: #fff;
        padding: 10px;
        text-align: center;
        border-radius: 5px 5px 0 0;
      }
      .content {
        padding: 20px;
        background-color: #fff;
        font-size: 18px;
      }
      .footer {
        text-align: center;
        padding: 10px;
        font-size: 12px;
        color: #777;
      }
      .code{
      font-size: 30px;
      background-color: #d8b4fe;
      color: #fff;
      padding: 2px;
      padding-left: 5px;
      padding-right: 5px;
      border-radius: 5px;
      }  
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Email Verification</h1>
      </div>
      <div class="content">
        <p>Hello, <strong>${name}</strong></p>
        <p>Your verification code is <span class="code">${code}</span>. It expires in 5 minutes.</p>
      </div>
      <div class="footer">
        <p>If you didn't request this email, please ignore it.</p>
      </div>
    </div>
  </body>
  </html>
`;


    const mailOptions = {
        from: `Talkora <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code',
        html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
};

export const verification = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verificationCode = generateVerificationCode();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiration

        // Store the verification code and expiration time
        await User.updateOne(
            { email },
            { 
                verificationCode, 
            }
        );

        await sendVerificationCode(email, verificationCode,user?.fullname);

        return 200
    } catch (error) {
       return res.status(500).json({ message: 'Something went wrong', error });
    }
};
