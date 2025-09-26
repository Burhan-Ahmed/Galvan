"use client";
import { useEffect, useState } from "react";

export default function UserPage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Decode token (simplest way: parse JWT payload)
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser({
      id: payload.id,
      name: payload.role === "user" ? "User" : "SuperAdmin", // optional
      email: payload.email || "unknown",
      mobile: payload.mobile_number || "unknown",
    });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
      <ul className="space-y-3">
        <li>ID: {user.id}</li>
        <li>Name: {user.name}</li>
        <li>Email: {user.email}</li>
        <li>Mobile: {user.mobile}</li>
      </ul>
    </div>
  );
}
