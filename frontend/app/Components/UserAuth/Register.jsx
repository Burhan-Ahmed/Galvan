"use client";
import { useState } from "react";
import axios from "axios";

export default function Register({ onSwitch }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://127.0.0.1:5000/auth/register", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        mobile,
      });
      setMessage(res.data.message || "✅ Registration successful! Please verify OTP.");
    } catch (err) {
      setMessage(err.response?.data?.message || "❌ Error registering user");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-400 via-blue-500 to-purple-600">
      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Register</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="First Name"
              className="w-1/2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Last Name"
              className="w-1/2 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Mobile Number"
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            onChange={(e) => setMobile(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Register
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <button
            onClick={onSwitch}
            className="text-green-600 hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </div>
  );
}
