import React, { useEffect, useState,useContext } from 'react';
import { useSearchParams,useNavigate } from 'react-router-dom';
import { toast,ToastContainer } from 'react-toastify';
import { AuthContext,apiUrl } from '../context/Context';

const VerifyLogin = () => {

  const navigator = useNavigate();

  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');

  console.log(email)

  const [verificationCode, setVerificationCode] = useState('');
  const verifyEmail = email;

  const { auth,setAuth } = useContext(AuthContext)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Replace with your API endpoint
    const response = await fetch(`${apiUrl}/auth/verify`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: verifyEmail,  // Replace with actual user ID
        verificationCode,
      }),
    });

    const data = await response.json();

    if (response.status === 200) {
      setAuth(true)
      toast.success(data.message);
    } else {
      toast.error(data.message);
    }
  };

  useEffect(() => {
    if (auth) {
      setTimeout(() => {
        navigator('/')
      }, 3000);
    }
  }, [auth,navigator])
  

  return (
<div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-200 to-purple-300">
  <ToastContainer />
  <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-300">
    <h2 className="text-3xl font-semibold text-gray-800 mb-4">Verify Your Email</h2>
    <p className="text-gray-600 mb-6">We sent a verification code to <span className="font-semibold">{email}</span></p>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
          Verification Code
        </label>
        <input
          type="text"
          id="verificationCode"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-300 ease-in-out"
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-md shadow-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out"
      >
        Verify
      </button>
    </form>
  </div>
</div>

  );
};

export default VerifyLogin;
