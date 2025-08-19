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
import EditMeeting from "./components/EditMeeting.jsx";
import { useAuth, AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import CreateMemberDialog from "./components/CreateMember.jsx";
import UpdateCommittee from "./components/UpdateCommittee.jsx";

import CommitteeLayout from "./Layouts/CommitteeLayout.jsx";
import React, { useEffect } from "react";
import MemberDetails from "./components/MemberDetails.jsx";
import MainLayout from "./Layouts/MainLayout.jsx";
import UpdateMember from "./components/UpdateMember.jsx";
import { useTheme } from "./context/ThemeContext.jsx";

const ProtectedRoute = ({ children }) => {
   const { isAuthenticated, isAuthLoading, checkAuthStatus } = useAuth();
   const { isDarkMode } = useTheme();

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
         <div
            className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
               isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
         >
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
               <p
                  className={`transition-colors duration-200 ${
                     isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
               >
                  {/* Loading authentication... */}
               </p>
            </div>
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
         <ThemeProvider>
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
                        path="/committees/:committeeId/meetings/:meetingId/edit"
                        element={
                           <ProtectedRoute>
                              <EditMeeting />
                           </ProtectedRoute>
                        }
                     />

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

                     <Route path="*" element={<NotFoundPage />} />
                  </Route>
               </Routes>
            </AuthProvider>
         </ThemeProvider>
      </Router>
   );
}

const HomeRedirector = () => {
   const { isAuthenticated, isAuthLoading } = useAuth();
   const { isDarkMode } = useTheme();

   if (isAuthLoading) {
      return (
         <div
            className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
               isDarkMode ? "bg-gray-900" : "bg-gray-50"
            }`}
         >
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
               <p
                  className={`transition-colors duration-200 ${
                     isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
               >
                  Loading application...
               </p>
            </div>
         </div>
      );
   }

   return <Navigate to={isAuthenticated ? "/home" : "/login"} replace />;
};

const NotFoundPage = () => {
   const { isDarkMode } = useTheme();

   return (
      <div
         className={`min-h-screen flex items-center justify-center transition-colors duration-200 ${
            isDarkMode ? "bg-gray-900" : "bg-gray-50"
         }`}
      >
         <div className="text-center">
            <h1
               className={`text-4xl font-bold mb-4 transition-colors duration-200 ${
                  isDarkMode ? "text-gray-200" : "text-gray-800"
               }`}
            >
               404
            </h1>
            <p
               className={`text-lg transition-colors duration-200 ${
                  isDarkMode ? "text-gray-400" : "text-gray-600"
               }`}
            >
               Page Not Found
            </p>
         </div>
      </div>
   );
};

export default App;
