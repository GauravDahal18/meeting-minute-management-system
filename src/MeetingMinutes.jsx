import {useAuth} from "./context/AuthContext.jsx";

function MeetingMinutes() {
  const {isAuthenticated, logout} = useAuth();

  return (
    <div>
      <div>
        <h1>Meeting Minutes Dashboard!</h1>
        <button onClick={logout}>Logout</button>
      </div>

      <p>
        Login successfull ... Minutes dashboard is here.... </p>

    </div>
  );
}

export default MeetingMinutes;
