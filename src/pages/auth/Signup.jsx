import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // <-- import icons

function Signup() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  // State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setGlobalError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    const { firstname, lastname, email, username, password, confirmPassword } =
      formData;

    const newErrors = {};

    if (!firstname) newErrors.firstname = "First name is required.";
    if (!lastname) newErrors.lastname = "Last name is required.";
    if (!email) newErrors.email = "Email is required.";
    if (!username) newErrors.username = "Username is required.";
    if (!password) newErrors.password = "Password is required.";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstname,
          lastName: lastname,
          username,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.success("✅ Signup successful!", {
          position: "top-right",
          autoClose: 1000,
          theme: "colored",
        });
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else if (response.status === 400 && data.errors) {
        setFieldErrors(data.errors);
      } else {
        toast.error(data.message || "❌ Signup failed.", {
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

  const inputClass =
    "w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500";

  const errorText = (msg) => <p className="text-red-500 text-sm mt-1">{msg}</p>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-200">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">
          Create an Account
        </h2>

        {globalError && (
          <p className="text-red-600 text-center text-sm mb-4">{globalError}</p>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstname"
                value={formData.firstname}
                onChange={handleChange}
                className={inputClass}
              />
              {fieldErrors.firstname && errorText(fieldErrors.firstname)}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastname"
                value={formData.lastname}
                onChange={handleChange}
                className={inputClass}
              />
              {fieldErrors.lastname && errorText(fieldErrors.lastname)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={inputClass}
            />
            {fieldErrors.email && errorText(fieldErrors.email)}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={inputClass}
            />
            {fieldErrors.username && errorText(fieldErrors.username)}
          </div>

          {/* Password input with eye icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={inputClass}
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
            {fieldErrors.password && errorText(fieldErrors.password)}
          </div>

          {/* Confirm Password input with eye icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {fieldErrors.confirmPassword &&
              errorText(fieldErrors.confirmPassword)}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition duration-200 disabled:opacity-50"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>

          <div className="text-sm text-center text-gray-600 mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-purple-600 hover:underline font-medium"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
