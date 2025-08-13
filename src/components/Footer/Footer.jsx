import React from "react";

const Footer = () => {
   const currentYear = new Date().getFullYear();

   return (
      <footer className="bg-gradient-to-r from-gray-600 via-slate-700 to-gray-700 border-t border-gray-500 shadow-lg">
         <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
               <div className="text-center md:text-left">
                  <p className="text-gray-200 text-sm">
                     © {currentYear} Institute of Engineering, Pulchowk Campus.
                     All rights reserved.
                  </p>
               </div>

               <div className="flex gap-6 text-sm">
                  <span className="text-amber-200 hover:text-amber-100 transition-colors cursor-pointer">
                     Privacy Policy
                  </span>
                  <span className="text-amber-200 hover:text-amber-100 transition-colors cursor-pointer">
                     Terms of Service
                  </span>
                  <span className="text-amber-200 hover:text-amber-100 transition-colors cursor-pointer">
                     Contact
                  </span>
               </div>
            </div>
         </div>
      </footer>
   );
};

export default Footer;
