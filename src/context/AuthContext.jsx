import React, {createContext,useState,useEffect,useContext,useCallback} from "react";
import {useNavigate} from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const navigate = useNavigate();

  // check authentication status with the backend
  const checkAuthStatus = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        setIsAuthenticated(true);
        console.log("Auth Status Check: Authenticated.");
      } else {
        setIsAuthenticated(false);
        let errorText;
        try {
          errorText = await response.text();
        } catch (e) {
          errorText = "Unknown error";
        }
        console.log("Auth Status Check: Not Authenticated. Reason:", errorText);
      }
    } catch (error) {
      console.error("Network error during auth status check:", error);
      setIsAuthenticated(false);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  //authentication for initial load
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async () => {
    await checkAuthStatus();
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:8080/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      // Ignore network errors on logout
    }
    setIsAuthenticated(false);
    navigate("/login", { replace: true });
  };

  const contextValue = {
    isAuthenticated,
    isAuthLoading,
    login,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
