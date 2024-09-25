import React, {  useEffect, useState,useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast,ToastContainer } from "react-toastify";
import { AuthContext,apiUrl } from '../context/Context';


export default function Login() {
  
  const navigate = useNavigate()

  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })

  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    })
  }

  const { auth,setAuth } = useContext(AuthContext)
  const [isVerify, setIsVerify] = useState(false)

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(loginData)
    })
    const data = await res.json();
    if(res.status===200){
      setAuth(true)
      setIsVerify(true)
      navigate('/')
    }
    else if(res.status===403){
      navigate('/verify?email='+loginData.email)
    }
    else{
      toast.error(data.message)
    }
  }

  useEffect(() => {
    if(isVerify){
      navigate('/')
    }
  },[isVerify,navigate])

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-200 to-purple-300">
      <ToastContainer />
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input onChange={handleChange} type="email" name="email" className="w-full px-4 py-2 border rounded" placeholder="Enter your email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input onChange={handleChange} autoComplete="new-password" name="password" type="password" className="w-full px-4 py-2 border rounded" placeholder="Enter your password" />
          </div>
          <a href="" className="hover:underline text-blue-700">Forgot your password?</a>
          <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-md hover:bg-blue-600">Login</button>
          <p className="text-center">Don't have an account? <Link to="/signup" className="text-blue-700 hover:underline">Create a Account</Link></p>
        </form>
      </div>
    </div>
  );
}
