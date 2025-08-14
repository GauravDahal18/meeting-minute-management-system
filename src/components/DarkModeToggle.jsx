import React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const DarkModeToggle = ({ className = "" }) => {
   const { isDarkMode, toggleDarkMode } = useTheme();

   return (
      <button
         onClick={toggleDarkMode}
         className={`inline-flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg border ${
            isDarkMode
               ? "bg-gray-700 hover:bg-gray-600 text-yellow-300 border-gray-600"
               : "bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-300"
         } ${className}`}
         title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
         aria-label={
            isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"
         }
      >
         {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>
   );
};

export default DarkModeToggle;
