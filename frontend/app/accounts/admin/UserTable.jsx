"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function UserTable({ users: propUsers, handleDelete, openEditModal }) {
  const [internalUsers, setInternalUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://127.0.0.1:5000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Filter superadmin and only show verified users
      const filtered = response.data.filter(
        (user) => user.role !== "superadmin" && user.is_verified
      );
      setInternalUsers(filtered);
    } catch (err) {
      console.error("UserTable: error fetching users ->", err);
      setInternalUsers([]); // clear on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!propUsers) fetchUsers();
  }, []);

  const internalDelete = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchUsers();
    } catch (err) {
      console.error("UserTable: error deleting user ->", err);
    }
  };

  const internalOpenEdit = (user) => {
    const first_name = prompt("First Name", user.first_name);
    const last_name = prompt("Last Name", user.last_name);
    if (!first_name || !last_name) return;

    axios
      .put(
        `http://127.0.0.1:5000/admin/users/${user.id}`,
        { first_name, last_name },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => fetchUsers())
      .catch((err) => console.error("UserTable: error editing user ->", err));
  };

  const list = Array.isArray(propUsers) ? propUsers : internalUsers;

  return (
    <div className="text-black w-full">
      <h2 className="text-3xl font-bold mb-4">View Users</h2>

      {loading ? (
        <p className="py-4">Loading users...</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-md">
          <table className="min-w-full bg-white border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list && list.length > 0 ? (
                list.map((u, idx) => (
                  <tr
                    key={u.id || idx}
                    className="border-t hover:bg-gray-100 transition"
                  >
                    <td className="px-4 py-2">{u.id}</td>
                    <td className="px-4 py-2">
                      {u.first_name} {u.last_name}
                    </td>
                    <td className="px-4 py-2">{u.email}</td>
                    <td className="px-4 py-2">{u.role}</td>
                    <td className="px-4 py-2 flex gap-2 flex-wrap">
                      {u.role !== "superadmin" && (
                        <>
                          <button
                            onClick={() =>
                              handleDelete
                                ? handleDelete(u.id)
                                : internalDelete(u.id)
                            }
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>

                          <button
                            onClick={() =>
                              openEditModal
                                ? openEditModal(u)
                                : internalOpenEdit(u)
                            }
                            className="bg-yellow-400 text-black px-3 py-1 rounded hover:bg-yellow-500"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
