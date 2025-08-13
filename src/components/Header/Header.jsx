import ioeLogo from "./ioeLogo.png";
import LogoutButton from "../LogoutButton.jsx";
import { useNavigate } from "react-router-dom";

const Header = ({ showLogout = false }) => {
   const navigate = useNavigate();

   return (
      <header className="relative flex items-center justify-between bg-gradient-to-r from-gray-600 via-slate-700 to-gray-700 p-4 md:p-5 shadow-lg border-b border-gray-500">
         {/* Left Side - IOE Logo and Text */}
         <div
            className="flex items-center gap-4 min-w-0 flex-shrink-0 cursor-pointer"
            onClick={() => navigate("/home")}
         >
            <div className="relative group">
               <img
                  src={ioeLogo}
                  alt="IOE Pulchowk Campus Logo"
                  className="w-auto h-12 md:h-16 object-contain drop-shadow-lg transition-transform duration-300 group-hover:scale-105 bg-white rounded-full p-1"
               />
            </div>
            <div className="hidden md:block">
               <div className="text-white font-bold text-lg md:text-xl leading-tight font-serif">
                  INSTITUTE OF ENGINEERING
               </div>
               <div className="text-gray-100 text-sm md:text-base font-medium font-sans">
                  Pulchowk Campus
               </div>
            </div>
         </div>

         {/* Center - Meeting Minute Management System */}
         <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-lg md:text-2xl font-bold tracking-wide font-serif whitespace-nowrap">
               <span className="bg-gradient-to-r from-amber-200 to-yellow-100 bg-clip-text text-transparent">
                  Meeting Minute Management System
               </span>
            </h1>
         </div>

         {/* Right Side - Logout Button */}
         {showLogout && (
            <div className="ml-4 flex-shrink-0">
               <LogoutButton className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl border border-amber-500/30 font-sans" />
            </div>
         )}
      </header>
   );
};

export default Header;
