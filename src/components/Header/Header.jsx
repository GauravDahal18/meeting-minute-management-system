import ioeLogo from "./ioeLogo.png";
import LogoutButton from "../LogoutButton.jsx";

const Header = ({ showLogout = false }) => {
  return (
    <header className="relative flex flex-col md:flex-row items-center justify-between bg-gradient-to-r from-blue-50 via-blue-100 to-indigo-100 p-6 shadow-2xl border-b-4 border-blue-300">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 to-transparent opacity-40"></div>
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-4 left-4 w-8 h-8 border-2 border-blue-300/40 rounded-full"></div>
        <div className="absolute top-8 right-8 w-6 h-6 border-2 border-blue-400/30 rounded-full"></div>
        <div className="absolute bottom-6 left-16 w-4 h-4 border-2 border-blue-300/25 rounded-full"></div>
        <div className="absolute bottom-4 right-4 w-10 h-10 border-2 border-blue-400/35 rounded-full"></div>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-center flex-1 z-10">
        <div className="relative group">
          <img
            src={ioeLogo}
            alt="IOE Pulchowk Campus Logo"
            className="w-auto h-auto max-h-32 object-contain md:mr-12 drop-shadow-lg transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-blue-200/20 rounded-full blur-xl opacity-30 group-hover:opacity-40 transition-opacity duration-300"></div>
        </div>

        <div className="text-center mt-6 md:mt-2 relative">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 drop-shadow-sm mb-2 tracking-wide">
            <span className="bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">
              IOE Pulchowk Campus
            </span>
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto mb-3 rounded-full shadow-lg"></div>
          <p className="text-lg md:text-xl text-blue-700 font-medium tracking-wide drop-shadow-sm mb-2">
            Department of Electronics and Computer Engineering
          </p>
          <div className="mt-3">
            <h2 className="text-lg md:text-xl font-semibold text-blue-800 tracking-wide">
              Meeting Minute Management System
            </h2>
          </div>
        </div>
      </div>

      {showLogout && (
        <div className="relative z-10 mt-4 md:mt-0">
          <LogoutButton className="relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl border border-red-400/30" />
        </div>
      )}
    </header>
  );
};

export default Header;
