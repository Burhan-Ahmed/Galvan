"use client";
import { useState } from "react";
import axios from "axios";
import Link from "next/link";


export default function Login({ onSwitch }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [token, setToken] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://127.0.0.1:5000/auth/login", { email, password });
            setToken(res.data.access_token);
            setMessage("✅ Login successful!");
        } catch (err) {
            setMessage(err.response?.data?.message || "❌ Error logging in");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Login</h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        Login
                    </button>
                </form>

                {message && (
                    <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
                )}

                {token && (
                    <div className="mt-4 bg-gray-100 p-3 rounded text-xs break-all">
                        <strong>JWT:</strong> {token}
                    </div>
                )}

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <a href="/register" className="text-indigo-600 hover:underline">
                        Register
                    </a>
                </p>
            </div>
        </div>
    );
}
