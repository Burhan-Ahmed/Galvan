"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserPage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        id: payload.sub,
        name: `${payload.first_name} ${payload.last_name}`,
        email: payload.email,
        mobile: payload.mobile_number,
        role: payload.role,
      });
    } catch (err) {
      console.error("Invalid token:", err);
      localStorage.removeItem("access_token");
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  if (!user) return <p className="p-6 text-center text-gray-600">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">
          Welcome, {user.name}
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition w-full sm:w-auto"
        >
          Logout
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Details</h2>
        <ul className="space-y-3 text-gray-700">
          <li><strong>ID:</strong> {user.id}</li>
          <li><strong>Name:</strong> {user.name}</li>
          <li><strong>Email:</strong> {user.email}</li>
          <li><strong>Mobile:</strong> {user.mobile}</li>
          <li><strong>Role:</strong> {user.role}</li>
        </ul>
      </div>
    </div>
  );
}
