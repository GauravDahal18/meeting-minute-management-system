import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Signup from "./pages/auth/Signup.jsx";
import CommitteeDashboard from "./components/CommitteeDashboard.jsx";
import CreateCommitteeDialog from "./components/CreateCommittee.jsx";
import CommitteeDetails from "./components/CommitteeDetails.jsx";
import CreateMeetingDialog from "./components/CreateMeeting.jsx";
import { useAuth, AuthProvider } from "./context/AuthContext.jsx";

import CommitteeLayout from "./Layouts/CommitteeLayout.jsx";
import React, { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading, checkAuthStatus } = useAuth();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  if (isAuthLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        {" "}
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/home"
            element={
              // <ProtectedRoute>
              <CommitteeDashboard />
              //</ProtectedRoute>
            }
          />

          <Route
            path="/home/createCommittee"
            element={
              // <ProtectedRoute>
              <CreateCommitteeDialog />
              // </ProtectedRoute>
            }
          />
          <Route
            path="/committee/:committeeId"
            element={
              <ProtectedRoute>
                <CommitteeLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CommitteeDetails />} />
            <Route
              path="createMeeting"
              element={
                <ProtectedRoute>
                  <CreateMeetingDialog />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="/" element={<HomeRedirector />} />

          <Route
            path="*"
            element={
              <h1 style={{ textAlign: "center", marginTop: "50px" }}>
                404 - Page Not Found
              </h1>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

const HomeRedirector = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading application...
      </div>
    );
  }

  return <Navigate to={isAuthenticated ? "/home" : "/login"} replace />;
};

export default App;
