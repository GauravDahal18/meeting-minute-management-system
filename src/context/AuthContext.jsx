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
      const response = await fetch("http://localhost:8080/isAuthenticated", {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        setIsAuthenticated(true);
        console.log("Auth Status Check: Authenticated.");
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        console.log("Auth Status Check: Not Authenticated.");
      } else {
        setIsAuthenticated(false);
        console.log("Auth Status Check: Unexpected status:", response.status);
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
      const response = await fetch("http://localhost:8080/api/logout", {
        method: "GET",
        credentials: "include",
      });
      
      if (response.status === 200) {
        console.log("Logout successful");
      } else if (response.status === 401) {
        console.log("User was not logged in during logout attempt");
      }
    } catch (e) {
      console.error("Network error during logout:", e);
      
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