import { yupResolver } from "@hookform/resolvers/yup";
import { sendPasswordResetEmail } from "firebase/auth";
import React, { useState } from "react";
import ReCaptcha from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { FiBookOpen } from "react-icons/fi";
import * as yup from "yup";
import { auth } from "../config/firebase";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [captcha, setCaptcha] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  let schema = yup.object({
    email: yup
      .string()
      .email("Please enter a valid email")
      .required("Please enter an email"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const handleResetPassword = async (data) => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      await sendPasswordResetEmail(auth, data.email);
      setMessage(
        "Password reset email sent! Check your inbox. If you dont see it in a few minutes please check your spam folder."
      );
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setError(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="text-center mx-auto max-w-md pt-32">
      <div className="flex items-center justify-center gap-2 mb-4">
        <FiBookOpen className="text-primary text-4xl" />
        <p className="text-text font-bold text-2xl">Reset your password</p>
      </div>

      {error && (
        <p
          className={`border p-4 rounded-xl mb-4 border-red-300 bg-red-200 text-red-500`}
        >
          {error}
        </p>
      )}
      <div className="w-full p-6 border border-gray rounded-xl">
        {message && (
          <div>
            <p
              className={`border p-4 rounded-xl  border-gray  text-text-light`}
            >
              {message}
            </p>
            <button className="btn-primary w-full mt-4">
              <Link to="/signin">Return to sign in</Link>
            </button>
          </div>
        )}
        {!message && (
          <form
            onSubmit={handleSubmit(handleResetPassword)}
            className="flex flex-col"
          >
            <label
              htmlFor="emailAssociated"
              className="text-start mb-2 text-text"
            >
              Enter the email associated with your account
            </label>
            <input
              type="text"
              id="emailAssociated"
              placeholder="Email"
              className="border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-offset-2"
              {...register("email")}
            />
            {errors.email && (
              <p className="self-start mt-2 text-red-500">
                {errors.email?.message}
              </p>
            )}
            <ReCaptcha
              className="mt-4 mx-auto"
              sitekey="6LcnEAYrAAAAAGBxX_UGCHnzYmCYu_yBwRERtWFs"
              onChange={(e) => setCaptcha(e)}
            />
            <button
              type="submit"
              disabled={!captcha || loading}
              className="btn-primary mt-4"
            >
              Send password reset email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
