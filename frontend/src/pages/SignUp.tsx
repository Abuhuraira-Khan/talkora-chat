import React, { useEffect, useRef, useState } from "react";
// import { configDotenv } from "dotenv";
import { useNavigate,Link } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { apiUrl } from "../context/Context";


// configDotenv();

export default function SignUp() {

  const navigator = useNavigate();

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    username: '',
    fullname: ''
  })

  const deBounceTime = useRef<any | null>(null)
  const [usernameAvailable, setUsernameAvailable] = useState(false)

  // form validate state
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value
    })
    // if(signUpData.username){
    //   console.log("first")
    // }
  }

  const handleSubmit = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await fetch(`${apiUrl}/auth/signup`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(signUpData)
    })
    const data = await res.json();
    if(res.status===201){
      navigator('/verify?email='+signUpData.email)
    }else{
      toast.error(data.message)
    }
  }

  // handleUserNameChange
  const handleUserNameChange =async (e:React.ChangeEvent<HTMLInputElement>) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    deBounceTime.current = setTimeout(async() => {
      const res = await fetch(`${apiUrl}/auth/check-username`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: signUpData.username
        })
      })
      if(res.status===200){
        setUsernameAvailable(true)
      }else{
        setUsernameAvailable(false)
      }
    }, 500)
        
    return () => {
      clearTimeout(deBounceTime.current)
    }
  }, [signUpData.username])

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-200 to-purple-300">
      <ToastContainer />
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-gray-300">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input onChange={handleChange} type="email" name="email" className={`w-full px-4 py-2  ${signUpData.email && !signUpData.email.includes('@'&&'.com') ? 'border-red-500 border' : 'border'} ${signUpData.email && signUpData.email.includes('@'&&'.com') ? 'border-green-500 border' : ''} outline-none rounded`} placeholder="Email" />
          </div>
          <div>
            <input onChange={handleUserNameChange} name="username" type="text" className={`w-full px-4 py-2 border rounded ${usernameAvailable ? 'border-green-500 border' : 'border'} ${signUpData.username&&!usernameAvailable ? 'border-red-500 border' : ''} outline-none `} placeholder="Username" />
          </div>
          <div>
            <input onChange={handleChange}  name="fullname" type="text" className={`w-full px-4 py-2  ${signUpData.fullname? 'border-green-500 border' : 'border'} outline-none rounded`} placeholder="Full Name" />
          </div>
          <div>
            <input onChange={handleChange} autoComplete="new-password" name="password" type="password" className={`w-full px-4 py-2  ${signUpData.password && signUpData.password.length < 8 ? 'border-red-500 border' : 'border'} ${signUpData.password && signUpData.password.length >= 8 ? 'border-green-500 border' : ''} outline-none rounded`} placeholder="Password" />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 px-4 rounded-md shadow-md hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-300 ease-in-out"
          >
            Create
          </button>
          <p className="text-center">Have an account? <Link to="/login" className="text-blue-700 hover:underline">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
