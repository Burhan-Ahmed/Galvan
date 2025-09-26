"use client";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white p-6 transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-64"} md:translate-x-0 md:relative md:flex-shrink-0`}
      >
        <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>
        <nav className="flex flex-col gap-3">
          <button
            className="hover:bg-gray-700 p-2 rounded text-left w-full"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("navigate", { detail: "home" })
              )
            }
          >
            Home
          </button>
          <button
            className="hover:bg-gray-700 p-2 rounded text-left w-full"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("navigate", { detail: "view" })
              )
            }
          >
            View Users
          </button>
          <button
            className="hover:bg-gray-700 p-2 rounded text-left w-full"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("navigate", { detail: "create" })
              )
            }
          >
            Create User
          </button>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto md:ml-64">
        {/* Mobile toggle */}
        <div className="md:hidden flex justify-start p-2 bg-gray-800">
          <button
            className="text-white bg-gray-700 px-3 py-1 rounded"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? "Close" : "Menu"}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
