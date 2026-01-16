import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react"
import { useDispatch } from "react-redux";
import { loginUser } from "@/store/auth-slice";
import { toast } from "sonner"
const initialState = {
  userName : "",
  email : "",
  password : ""
}

const Login = () => {

  const [formData , setFormData] = useState(initialState)
  const dispatch = useDispatch()
  
  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(loginUser(formData)).then(data => {
      if(data?.payload?.success){
        toast.success(data?.payload?.message)
      }
      else{
        toast.error(data?.payload.message)
      }
    })
  }
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="w-full max-w-md space-y-8 text-white">
      <div className="text-center">
        <h2 className="text-3xl font-bold">Sign in to your account</h2>
        <p className="text-sm text-gray-400">Welcome back to Ecommerce!</p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value = {formData.email}
              onChange = {handleChange}
              required
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value = {formData.password}
              onChange = {handleChange}
              required
              className="mt-1 w-full rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </div>
      </form>

      <p className="text-sm text-gray-400 text-center">
        Don't have an account? 
    <Link to="/auth/register" className="text-indigo-400 hover:underline">
    Register
    </Link>
      </p>
    </div>
  );
};

export default Login;
