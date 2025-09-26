"use client";
import { useState } from "react";
import axios from "axios";

export default function UserForm({ onCreated }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    mobile_number: "",
    profile_picture: null,
  });

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      for (let key in form) {
        if (form[key]) data.append(key, form[key]);
      }
      await axios.post("http://127.0.0.1:5000/admin/users", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForm({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        mobile_number: "",
        profile_picture: null,
      });
      onCreated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      className="bg-white text-black p-6 rounded shadow flex flex-col gap-4 max-w-full sm:max-w-xl mx-auto"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center sm:text-left">
        New User Registration
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="First Name"
          value={form.first_name}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
          required
          className="border p-2 rounded w-full"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={form.last_name}
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
          required
          className="border p-2 rounded w-full"
        />
      </div>

      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        className="border p-2 rounded w-full"
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        className="border p-2 rounded w-full"
      />
      <input
        type="text"
        placeholder="Mobile Number"
        value={form.mobile_number}
        onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
        required
        className="border p-2 rounded w-full"
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setForm({ ...form, profile_picture: e.target.files[0] })}
        className="border p-2 rounded w-full"
      />

      <button className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition">
        Create
      </button>
    </form>
  );
}
