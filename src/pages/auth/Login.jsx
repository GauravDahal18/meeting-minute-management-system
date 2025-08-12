import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Header from "../../components/Header/Header.jsx";

function Login() {
  const [username, setUsername] = useState("username");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const {
    login: authContextLogin,
    isAuthenticated,
    isAuthLoading,
    checkAuthStatus,
  } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, isAuthLoading, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const newErrors = { username: "", password: "" };

    if (!username) newErrors.username = "Please enter your username.";
    if (!password) newErrors.password = "Please enter your password.";

    setFormErrors(newErrors);

    if (newErrors.username || newErrors.password) {
      setLoading(false);
      return;
    }

    const credentials = `${username}:${password}`;
    const encodedCredentials = btoa(credentials);
    const LOGIN_API_URL = `http://localhost:8080/api/login`;

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${encodedCredentials}`,
        },
        credentials: "include",
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 200) {
        toast.success("✅ Login successful!", {
          position: "top-right",
          autoClose: 500,
          theme: "colored",
        });

        authContextLogin(); // update context
        checkAuthStatus(); // optional refresh

        // Delay navigation to let toast finish
        setTimeout(() => {
          navigate("/home", { replace: true });
        }, 1500);
      } else if (response.status === 401) {
        toast.error("❌ Invalid username or password.", {
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
        });
      } else {
        toast.error(data.message || "❌ Login failed.", {
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Could not connect to the server.", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isAuthLoading && !isAuthenticated) {
    return (
      <div className="text-center mt-20 text-gray-600 text-lg">
        Checking authentication status...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col">
      <div className="flex items-center justify-center px-4 py-14">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">
            Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="usernameInput"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="usernameInput"
                placeholder="Enter username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFormErrors((prev) => ({ ...prev, username: "" }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formErrors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.username}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="passwordInput"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="passwordInput"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFormErrors((prev) => ({ ...prev, password: "" }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formErrors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {formErrors.password}
                </p>
              )}
            </div>
            {error && (
              <p className="text-red-600 text-sm font-medium text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-800 text-white py-2 rounded-lg hover:bg-blue-900 transition duration-200 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
            <div className="text-sm text-center text-gray-600 mt-4">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-blue-600 hover:underline font-medium"
              >
                Sign up
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
