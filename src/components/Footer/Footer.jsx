import React from "react";
import { useTheme } from "../../context/ThemeContext.jsx";

const Footer = () => {
   const currentYear = new Date().getFullYear();
   const { isDarkMode } = useTheme();

   return (
      <footer
         className={`border-t shadow-lg transition-colors duration-200 ${
            isDarkMode
               ? "bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-gray-600"
               : "bg-gradient-to-r from-gray-600 via-slate-700 to-gray-700 border-gray-500"
         }`}
      >
         <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="text-center md:text-left">
                  <p
                     className={`text-sm transition-colors duration-200 ${
                        isDarkMode ? "text-gray-300" : "text-gray-200"
                     }`}
                  >
                     © {currentYear} Institute of Engineering, Pulchowk Campus.
                     All rights reserved.
                  </p>
               </div>

               <div className="flex gap-6 text-sm">
                  <span
                     className={`transition-colors cursor-pointer ${
                        isDarkMode
                           ? "text-amber-300 hover:text-amber-200"
                           : "text-amber-200 hover:text-amber-100"
                     }`}
                  >
                     Privacy Policy
                  </span>
                  <span
                     className={`transition-colors cursor-pointer ${
                        isDarkMode
                           ? "text-amber-300 hover:text-amber-200"
                           : "text-amber-200 hover:text-amber-100"
                     }`}
                  >
                     Terms of Service
                  </span>
                  <span
                     className={`transition-colors cursor-pointer ${
                        isDarkMode
                           ? "text-amber-300 hover:text-amber-200"
                           : "text-amber-200 hover:text-amber-100"
                     }`}
                  >
                     Contact
                  </span>
               </div>
            </div>
         </div>
      </footer>
   );
};

export default Footer;
