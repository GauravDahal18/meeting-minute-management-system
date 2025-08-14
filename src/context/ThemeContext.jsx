import React, { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext(null);

export const useTheme = () => {
   const context = useContext(ThemeContext);
   if (!context) {
      throw new Error("useTheme must be used within a ThemeProvider");
   }
   return context;
};

export const ThemeProvider = ({ children }) => {
   const [isDarkMode, setIsDarkMode] = useState(() => {
      // Check localStorage for saved preference, default to false (light mode)
      const savedTheme = localStorage.getItem("darkMode");
      return savedTheme ? JSON.parse(savedTheme) : false;
   });

   const toggleDarkMode = () => {
      setIsDarkMode((prev) => {
         const newMode = !prev;
         localStorage.setItem("darkMode", JSON.stringify(newMode));
         return newMode;
      });
   };

   // Apply theme class to document body
   useEffect(() => {
      if (isDarkMode) {
         document.body.classList.add("dark");
      } else {
         document.body.classList.remove("dark");
      }

      // Cleanup on unmount
      return () => {
         document.body.classList.remove("dark");
      };
   }, [isDarkMode]);

   const value = {
      isDarkMode,
      toggleDarkMode,
   };

   return (
      <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
   );
};

export default ThemeContext;
