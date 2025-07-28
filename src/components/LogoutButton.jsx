import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LogoutButton = ({ className = "" }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();

      toast.success("✅ Logged out successfully!", {
        position: "top-right",
        autoClose: 2000,
        theme: "colored",
      });

      // Navigate to login page
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("❌ Error during logout", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 font-medium ${className}`}
    >
      Logout
    </button>
  );
};

export default LogoutButton;
