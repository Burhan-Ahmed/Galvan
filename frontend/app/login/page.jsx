"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function Login({ onSwitch }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://127.0.0.1:5000/auth/login", { email, password });
            const { access_token, role } = res.data;

            // Save token & role
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("role", role);

            setMessage("Login successful!");

            // Navigate based on role
            if (role === "superadmin") {
                router.push("/accounts/admin");
            } else {
                router.push("/accounts/user");
            }

        } catch (err) {
            setMessage(err.response?.data?.message || "Error logging in");
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
                        className="w-full px-4 text-black py-3 border rounded-lg outline-none"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-3 text-black border rounded-lg outline-none"
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

                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <a href="/register" className="text-green-600 hover:underline font-semibold">
                        Register here
                    </a>
                </p>

            </div>
        </div>
    );
}
