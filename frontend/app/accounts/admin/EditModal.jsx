"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";

export default function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ first_name: "", last_name: "", mobile_number: "" });

  useEffect(() => {
    if (user) {
      setForm({
        first_name: user.first_name,
        last_name: user.last_name,
        mobile_number: user.mobile_number,
      });
    }
  }, [user]);

  const token = localStorage.getItem("access_token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://127.0.0.1:5000/admin/users/${user.id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSave({ id: user.id, ...form });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {user && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded shadow-lg w-96"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
          >
            <h2 className="text-lg text-black font-bold mb-4">Edit User</h2>
            <form onSubmit={handleSubmit} className="flex text-black flex-col gap-3">
              <input
                type="text"
                placeholder="First Name"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Mobile Number"
                value={form.mobile_number}
                onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                className="border p-2 rounded"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="border px-4 py-2 rounded">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                  Save
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
