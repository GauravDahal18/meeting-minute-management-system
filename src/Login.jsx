import React, {useState,useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useAuth} from "./context/AuthContext.jsx"; 

function Login() {
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(""); 

  const navigate = useNavigate(); 
  const {login: authContextLogin, isAuthenticated, isAuthLoading, checkAuthStatus} = useAuth(); 

  useEffect(() => {
      if (isAuthenticated && !isAuthLoading) { 
          navigate('/meeting-minutes', {replace: true }); 
      }
  }, [isAuthenticated, isAuthLoading, navigate]); 

  const handleLogin = async (event) => {
    event.preventDefault(); 
    setLoading(true); 
    setError(""); 

    const credentials = `${username}:${password}`; 
    const encodedCredentials = btoa(credentials); // btoa() is for Base64 encoding 

    const LOGIN_API_URL = `http://localhost:8080/api/login`; 

    try {
      const response = await fetch(LOGIN_API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json", 
          Authorization: `Basic ${encodedCredentials}`,
        },
        credentials: 'include'
      });

      if (response.status === 200) { 
        console.log("Login request successful. Backend should set cookie");
        await checkAuthStatus();
        navigate('/meeting-minutes', { replace: true });
      } else if (response.status === 401) {
        
        setError("Authentication Failed: Bad credentials");
      } else {
      
        let errorMsg = "Login failed. Please try again.";
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          try {
            errorMsg = await response.text() || errorMsg;
          } catch {}
        }
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Network error occurred during login:", err); 
      setError(
        "Could not connect to the server. Please check your internet or try again later."
      ); 
    } finally {
      setLoading(false); 
    }
  };

  if (isAuthLoading && !isAuthenticated) { 
      return <div style={{textAlign: 'center', marginTop: '50px'}}>Checking authentication status...</div>;
  }

  return (
    <div>
      <div>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="usernameInput">Username:</label>
            <input
              type="text"
              id="usernameInput"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="passwordInput">Password:</label>
            <input
              type="password"
              id="passwordInput"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p>{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;