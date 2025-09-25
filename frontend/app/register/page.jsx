"use client";
import { useState } from "react";
import axios from "axios";

export default function Register({ onSwitch }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [message, setMessage] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("mobile", mobile);
      if (profilePic) formData.append("profile_pic", profilePic);

      const res = await axios.post("http://127.0.0.1:5000/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage(res.data.message || "✅ Registration successful! Please verify OTP.");
      setOtpStep(true); // move to OTP verification step
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Error registering user");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h1>

        {!otpStep ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-1/2 px-4 py-3 text-black border rounded-lg outline-none"
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-1/2 px-4 py-3 border text-black rounded-lg outline-none"
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-3 border text-black rounded-lg  outline-none"
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border text-black rounded-lg outline-none"
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Mobile Number"
              className="w-full px-4 py-3 border text-black rounded-lg  outline-none"
              onChange={(e) => setMobile(e.target.value)}
              required
            />

            <input
              type="file"
              accept="image/*"
              className="w-full px-4 py-3 border text-black rounded-lg outline-none"
              onChange={(e) => setProfilePic(e.target.files?.[0] || null)}
            />

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Register
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-700">{message}</p>
            <a
              href="/otp"
              className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to OTP Verification
            </a>
          </div>
        )}

        {message && !otpStep && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}

        {!otpStep && (
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/" className="text-green-600 hover:underline">
              Login
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
