"use client";
import { useState } from "react";
import Login from "./Components/UserAuth/Login";
import Register from "./Components/UserAuth/Register";

export default function Home() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div>
      {showLogin ? (
        <Login onSwitch={() => setShowLogin(false)} />
      ) : (
        <Register onSwitch={() => setShowLogin(true)} />
      )}
    </div>
  );
}
