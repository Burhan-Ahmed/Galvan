"use client";
import { useEffect, useState } from "react";
import AdminLayout from "../AdminLayout";
import axios from "axios";

export default function AdminPage() {
    const [section, setSection] = useState("home");
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        mobile_number: "",
        profile_picture: "",
    });

    const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

    // Listen for sidebar navigation
    useEffect(() => {
        const handleNavigate = (e) => setSection(e.detail);
        window.addEventListener("navigate", handleNavigate);
        return () => window.removeEventListener("navigate", handleNavigate);
    }, []);

    // Fetch verified users excluding super admin
    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:5000/admin/users", {
                headers: { Authorization: `Bearer ${token}` },
            });

            const filtered = response.data.filter(
                (user) => user.role !== "superadmin" && user.is_verified
            );
            setUsers(filtered);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (section === "view" || section === "home") fetchUsers();
    }, [section]);

    // Create User
    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                "http://127.0.0.1:5000/admin/users",
                { ...form },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setForm({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                mobile_number: "",
                profile_picture: "",
            });
            setSection("view");
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    // Delete User
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    // Update User
    const handleUpdate = async (user) => {
        const first_name = prompt("New First Name", user.first_name);
        const last_name = prompt("New Last Name", user.last_name);
        if (!first_name || !last_name) return;
        try {
            await axios.put(
                `http://127.0.0.1:5000/admin/users/${user.id}`,
                { first_name, last_name },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchUsers();
        } catch (err) {
            console.error(err);
        }
    };

    // Render sections
    const renderSection = () => {
        switch (section) {
            case "home":
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Welcome, Super Admin</h2>
                        <p>Total Verified Users: {users.length}</p>
                        <p>Use the sidebar to manage users.</p>
                    </div>
                );

            case "view":
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-2">View Users</h2>
                        <table className="table-auto w-full border">
                            <thead>
                                <tr className="bg-gray-900 text-white">
                                    <th className="px-4 py-2">ID</th>
                                    <th className="px-4 py-2">Name</th>
                                    <th className="px-4 py-2">Email</th>
                                    <th className="px-4 py-2">Role</th>
                                    <th className="px-4 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id} className="border-t">
                                        <td className="px-4 py-2">{u.id}</td>
                                        <td className="px-4 py-2">{u.first_name} {u.last_name}</td>
                                        <td className="px-4 py-2">{u.email}</td>
                                        <td className="px-4 py-2">{u.role}</td>
                                        <td className="px-4 py-2 flex gap-2">
                                            {/* Only allow actions for non-superadmin */}
                                            {u.role !== "superadmin" && (
                                                <>
                                                    <button
                                                        onClick={() => handleDelete(u.id)}
                                                        className="bg-red-500 px-2 py-1 rounded text-white"
                                                    >
                                                        Delete
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdate(u)}
                                                        className="bg-yellow-400 px-2 py-1 rounded text-white"
                                                    >
                                                        Edit
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                );

            case "create":
                return (
                    <div>
                        <h2 className="text-xl font-bold mb-2">Create User</h2>
                        <form className="flex flex-col gap-2" onSubmit={handleCreate}>
                            {Object.keys(form).map((key) => (
                                <input
                                    key={key}
                                    type={key === "password" ? "password" : "text"}
                                    placeholder={key.replace("_", " ")}
                                    value={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    required
                                    className="border p-2 rounded"
                                />
                            ))}
                            <button className="bg-blue-500 text-white px-4 py-2 rounded mt-2">
                                Create
                            </button>
                        </form>
                    </div>
                );

            default:
                return <p>Select an option from the sidebar.</p>;
        }
    };

    return <AdminLayout>{renderSection()}</AdminLayout>;
}
