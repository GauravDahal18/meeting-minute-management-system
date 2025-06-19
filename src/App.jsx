import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login.jsx";
import MeetingMinutes from "./MeetingMinutes.jsx";
import { useAuth, AuthProvider } from "./context/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        {" "}
        Loading authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace:true />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login/>} />
          <Route
            path="/meeting-minutes"
            element={
              <ProtectedRoute>
                <MeetingMinutes />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<HomeRedirector/>} />

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
  const {isAuthenticated, isAuthLoading} = useAuth(); 

  if (isAuthLoading) {
    return(
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        Loading application...
      </div>
    ); 
  }

  return(
    <Navigate to={isAuthenticated ? "/meeting-minutes" : "/login"} replace:true />
  );
};

export default App;
