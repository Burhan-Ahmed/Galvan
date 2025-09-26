"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import AdminLayout from "@/app/AdminLayout";
import UserTable from "./UserTable";
import UserForm from "./UserForm";
import EditModal from "./EditModal";

export default function AdminPage() {
    const [activeSection, setActiveSection] = useState("home");
    const [users, setUsers] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const router = useRouter();

    const token =
        typeof window !== "undefined" ? localStorage.getItem("access_token") : "";

    const fetchUsers = async () => {
        try {
            const res = await axios.get("http://127.0.0.1:5000/admin/users", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const filtered = res.data.filter(
                (u) => u.role !== "superadmin" && u.is_verified
            );
            setUsers(filtered);
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    useEffect(() => {
        if (activeSection === "view" || activeSection === "home") {
            fetchUsers();
        }
    }, [activeSection]);

    useEffect(() => {
        const handler = (event) => setActiveSection(event.detail);
        window.addEventListener("navigate", handler);
        return () => window.removeEventListener("navigate", handler);
    }, []);

    const addUser = async (userData) => {
        try {
            const res = await axios.post("http://127.0.0.1:5000/admin/users", userData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers([...users, res.data]);
            setActiveSection("view");
        } catch (err) {
            console.error("Error creating user:", err);
        }
    };

    const updateUser = async (updatedUser) => {
        try {
            await axios.put(
                `http://127.0.0.1:5000/admin/users/${updatedUser.id}`,
                updatedUser,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            await fetchUsers();
            setEditingUser(null);
        } catch (err) {
            console.error("Error updating user:", err);
        }
    };

    const deleteUser = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.filter((u) => u.id !== id));
        } catch (err) {
            console.error("Error deleting user:", err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("role");
        router.push("/login");
    };

    const renderSection = () => {
        switch (activeSection) {
            case "home":
                return (
                    <div className="text-black w-full">
                        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center sm:text-left">
                            Dashboard Overview
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="bg-white p-4 rounded shadow text-center sm:text-left">
                                <h3 className="font-semibold text-gray-600">Total Users</h3>
                                <p className="text-xl font-bold">{users.length}</p>
                            </div>
                            <div className="bg-white p-4 rounded shadow text-center sm:text-left">
                                <h3 className="font-semibold text-gray-600">Active Sessions</h3>
                                <p className="text-xl font-bold">3</p>
                            </div>
                        </div>
                    </div>
                );

            case "view":
                return (
                    <div className="overflow-x-auto">
                        <UserTable
                            users={users}
                            handleDelete={deleteUser}
                            openEditModal={setEditingUser}
                        />
                    </div>
                );

            case "create":
                return (
                    <div className="px-2 sm:px-6">
                        <UserForm onSubmit={addUser} />
                    </div>
                );

            default:
                return <p className="text-center">Select an option from the sidebar</p>;
        }
    };

    return (
        <AdminLayout>
            <div className="p-4 sm:p-6 lg:p-8 w-full">
                {renderSection()}

                {editingUser && (
                    <EditModal
                        user={editingUser}
                        onClose={() => setEditingUser(null)}
                        onSave={updateUser}
                    />
                )}

                <div className="mt-6 flex justify-center sm:justify-end">
                    <button
                        onClick={handleLogout}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition w-full sm:w-auto"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </AdminLayout>
    );
}
