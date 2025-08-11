import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const hasCheckedAuth = useRef(false);
  const navigate = useNavigate();

  // check authentication status with the backend
  const checkAuthStatus = useCallback(async () => {
    console.log("checkAuthStatus called", {
      isAuthenticated,
      isAuthLoading,
      hasChecked: hasCheckedAuth.current,
    });

    // Don't check if we've already checked and are authenticated
    if (hasCheckedAuth.current && isAuthenticated) {
      console.log("checkAuthStatus: Skipping - already authenticated");
      return;
    }

    console.log("checkAuthStatus: Making API call");
    setIsAuthLoading(true);
    try {
      const response = await fetch("http://localhost:8080/isAuthenticated", {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 200) {
        setIsAuthenticated(true);
        hasCheckedAuth.current = true;
        console.log("Auth Status Check: Authenticated.");
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        hasCheckedAuth.current = true;
        console.log("Auth Status Check: Not Authenticated.");
      } else {
        setIsAuthenticated(false);
        hasCheckedAuth.current = true;
        console.log("Auth Status Check: Unexpected status:", response.status);
      }
    } catch (error) {
      console.error("Network error during auth status check:", error);
      setIsAuthenticated(false);
      hasCheckedAuth.current = true;
    } finally {
      setIsAuthLoading(false);
    }
  }, [isAuthenticated]);

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
    hasCheckedAuth.current = false; // Reset the auth check flag
    navigate("/login", { replace: true });
  };

  const contextValue = useMemo(
    () => ({
      isAuthenticated,
      isAuthLoading,
      login,
      logout,
      checkAuthStatus,
    }),
    [isAuthenticated, isAuthLoading, login, logout, checkAuthStatus]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
