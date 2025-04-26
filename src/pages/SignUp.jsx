import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiBookOpen } from "react-icons/fi";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "../contexts/AuthContext";
import { BiHide } from "react-icons/bi";
import { BiShow } from "react-icons/bi";

function SignUp() {
  const [loading, setLoading] = useState(false);
  const { signup, signupError, googleSignin, error } = useAuth();
  const [showPass, setShowPass] = useState(false);

  let schema = yup.object({
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Please enter an email"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters long")
      .required("Please enter a password"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const handleSignup = async (data) => {
    try {
      setLoading(true);
      await signup(data.email, data.password);
    } catch (error) {
      console.log("Error Signing up:", error.message);
    }
    setLoading(false);
  };

  const handleSigninGoogle = async () => {
    try {
      setLoading(true);
      await googleSignin();
    } catch (error) {
      console.log("Error signing in with Google:", error.message);
      setLoading(false);
    }
    setLoading(false);
  };

  return (
    <div className="text-center mx-auto max-w-md pt-28">
      <div className="space-y-1 mb-6">
        <Link to="/">
          <div className="flex items-center justify-center gap-2">
            <FiBookOpen className="text-primary text-5xl" />
            <p className="text-text font-bold text-3xl">SmartNotes</p>
          </div>
        </Link>
        <p className="text-text-light">
          Sign up to start creating notes and use our powerful study tools
        </p>
      </div>
      <div className="p-6 border border-gray rounded-lg">
        {(signupError || error) && (
          <p className="border border-red-300 bg-red-200 text-red-500 p-4 rounded-xl mb-4">
            {signupError || error}
          </p>
        )}
        <form onSubmit={handleSubmit(handleSignup)} className="flex flex-col">
          <label htmlFor="email-input" className="self-start mb-2 text-text">
            Email
          </label>
          <input
            id="email-input"
            type="text"
            placeholder="you@example.com"
            className="border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-offset-2"
            {...register("email")}
          />
          {errors.email && (
            <p className="self-start mt-2 text-red-500">
              {errors.email?.message}
            </p>
          )}
          <label
            htmlFor="password-input"
            className="self-start mt-4 mb-2 text-text"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password-input"
              type={showPass ? "text" : "password"}
              placeholder="password"
              className="border rounded-xl w-full px-4 py-2 outline-none focus:ring-2 focus:ring-offset-2"
              {...register("password")}
            />
            {!showPass ? (
              <BiShow
                onClick={() => setShowPass(true)}
                className="absolute right-4 top-3 text-text-light text-lg cursor-pointer"
              />
            ) : (
              <BiHide
                onClick={() => setShowPass(false)}
                className="absolute right-4 top-3 text-text-light text-lg cursor-pointer"
              />
            )}
          </div>
          {errors.password && (
            <p className="self-start mt-2 text-red-500">
              {errors.password?.message}
            </p>
          )}
          <button
            type="submit"
            className="btn-primary my-6 disabled:opacity-75"
            disabled={loading}
          >
            {loading ? "Signing up.." : "Sign up"}
          </button>
        </form>
        <div>
          <hr className="text-gray" />
          <p className="-mt-3 text-text bg-white px-3 w-fit mx-auto text-sm">
            Or
          </p>
        </div>
        <button
          onClick={handleSigninGoogle}
          disabled={loading}
          className="btn-primary flex gap-2 w-full justify-center items-center my-4 disabled:opacity-75 bg-white border border-gray hover:bg-gray-light"
        >
          <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 48 48"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            width="25px"
          >
            <path
              fill="#EA4335"
              d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
            ></path>
            <path
              fill="#4285F4"
              d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
            ></path>
            <path
              fill="#FBBC05"
              d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
            ></path>
            <path
              fill="#34A853"
              d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
            ></path>
            <path fill="none" d="M0 0h48v48H0z"></path>
          </svg>
          <span className="text-text">Sign in with Google</span>
        </button>
        <p className="text-text-light">
          Already have an account?{" "}
          <Link to="/signin" className="text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
