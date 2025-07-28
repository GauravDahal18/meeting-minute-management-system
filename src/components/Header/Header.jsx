import ioeLogo from "./ioeLogo.png";
import LogoutButton from "../LogoutButton.jsx";

const Header = ({ showLogout = false }) => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-between bg-white p-4 shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-center flex-1">
        <img
          src={ioeLogo}
          alt="IOE Pulchowk Campus Logo"
          className="w-auto h-auto max-h-32 object-contain md:mr-12"
        />
        <div className="text-center mt-6 md:mt-0">
          <h1 className="text-2xl font-bold text-gray-800">
            IOE Pulchowk Campus
          </h1>
          <p className="text-lg text-gray-700">
            Department of Electronics and Computer Engineering
          </p>
        </div>
      </div>
      {showLogout && <LogoutButton className="mt-4 md:mt-0" />}
    </header>
  );
};

export default Header;
