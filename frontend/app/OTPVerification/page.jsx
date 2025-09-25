"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function OTPVerify() {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://127.0.0.1:5000/auth/verify", { email, otp });
            setMessage(res.data.message);
            // Redirect to login after successful OTP verification
            setTimeout(() => {
                router.push("/login");
            }, 1500);
        } catch (err) {
            setMessage(err.response?.data?.message || "Error verifying OTP");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">OTP Verification</h1>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 text-black py-3 border rounded-lg outline-none"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        className="w-full px-4 py-3 text-black border rounded-lg outline-none"
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                    >
                        Verify OTP
                    </button>
                </form>

                {message && (
                    <p className="mt-4 text-center text-sm text-gray-700">{message}</p>
                )}

                <p className="mt-6 text-center text-sm text-gray-600">
                    Didn't receive OTP?{" "}
                    <a href="/register" className="text-indigo-600 hover:underline">
                        Resend / Register
                    </a>
                </p>
            </div>
        </div>
    );
}
