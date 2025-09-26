"use client";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-400">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white w-64 flex-shrink-0 p-6 transition-transform duration-300 md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-64"
          } md:block`}
      >
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
        <nav className="flex flex-col gap-3">
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "home" }))}>Home</button>
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "view" }))}>View Users</button>
          <button className="hover:bg-gray-700 p-2 rounded" onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "create" }))}>Create User</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 m-2 bg-gray-800 text-white rounded"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "Close" : "Menu"}
        </button>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
