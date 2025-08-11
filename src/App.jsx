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
import CreateMemberDialog from "./components/CreateMember.jsx";
import UpdateCommittee from "./components/UpdateCommittee.jsx";

import CommitteeLayout from "./Layouts/CommitteeLayout.jsx";
import React, { useEffect } from "react";
import MemberDetails from "./components/MemberDetails.jsx";
import MainLayout from "./Layouts/MainLayout.jsx";
import UpdateMember from "./components/UpdateMember.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading, checkAuthStatus } = useAuth();

  useEffect(() => {
    console.log("ProtectedRoute: useEffect triggered", {
      isAuthenticated,
      isAuthLoading,
    });
    // Only check auth status if we don't already know the user is authenticated
    if (!isAuthenticated && !isAuthLoading) {
      console.log("ProtectedRoute: Checking auth status");
      checkAuthStatus();
    }
  }, [isAuthenticated, isAuthLoading, checkAuthStatus]);

  console.log("ProtectedRoute: render", { isAuthenticated, isAuthLoading });

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
          <Route path="/" element={<MainLayout />}>
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
                element={<CreateMeetingDialog />}
                key="createMeeting"
              />
              <Route
                path="createMember"
                element={<CreateMemberDialog />}
                key="createMember"
              />
              <Route
                path="edit"
                element={<UpdateCommittee />}
                key="editCommittee"
              />
            </Route>

            <Route
              path="/member/:memberId"
              element={
                <ProtectedRoute>
                  <MemberDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/:memberId/edit"
              element={
                <ProtectedRoute>
                  <UpdateMember />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<HomeRedirector />} />

            <Route
              path="*"
              element={
                <h1 style={{ textAlign: "center", marginTop: "50px" }}>
                  404 - Page Not Found
                </h1>
              }
            />
          </Route>
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
