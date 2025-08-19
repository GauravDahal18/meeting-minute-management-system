import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";

const Loader = ({
   size = "default",
   text = "Loading...",
   fullScreen = false,
   showText = true,
}) => {
   const { isDarkMode } = useTheme();

   // Size configurations
   const sizeConfig = {
      small: {
         spinner: "h-4 w-4",
         container: "gap-2",
         text: "text-xs",
      },
      default: {
         spinner: "h-8 w-8",
         container: "gap-3",
         text: "text-sm",
      },
      large: {
         spinner: "h-12 w-12",
         container: "gap-4",
         text: "text-base",
      },
   };

   const config = sizeConfig[size] || sizeConfig.default;

   const LoaderContent = () => (
      <div
         className={`flex flex-col items-center justify-center ${config.container}`}
      >
         {/* Animated Spinner */}
         <div className="relative">
            <div
               className={`${
                  config.spinner
               } border-4 border-solid rounded-full animate-spin transition-colors duration-200 ${
                  isDarkMode
                     ? "border-gray-600 border-t-blue-400"
                     : "border-gray-200 border-t-blue-600"
               }`}
            ></div>
            {/* Inner spinning dot */}
            <div
               className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                  size === "small"
                     ? "h-1 w-1"
                     : size === "large"
                     ? "h-2 w-2"
                     : "h-1.5 w-1.5"
               } rounded-full animate-pulse transition-colors duration-200 ${
                  isDarkMode ? "bg-blue-400" : "bg-blue-600"
               }`}
            ></div>
         </div>

         {/* Loading Text */}
         {showText && (
            <div
               className={`${
                  config.text
               } font-medium transition-colors duration-200 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
               }`}
            >
               {text}
            </div>
         )}

         {/* Animated dots */}
         {showText && (
            <div className="flex space-x-1">
               <div
                  className={`w-1 h-1 rounded-full animate-bounce transition-colors duration-200 ${
                     isDarkMode ? "bg-blue-400" : "bg-blue-600"
                  }`}
                  style={{ animationDelay: "0ms" }}
               ></div>
               <div
                  className={`w-1 h-1 rounded-full animate-bounce transition-colors duration-200 ${
                     isDarkMode ? "bg-blue-400" : "bg-blue-600"
                  }`}
                  style={{ animationDelay: "150ms" }}
               ></div>
               <div
                  className={`w-1 h-1 rounded-full animate-bounce transition-colors duration-200 ${
                     isDarkMode ? "bg-blue-400" : "bg-blue-600"
                  }`}
                  style={{ animationDelay: "300ms" }}
               ></div>
            </div>
         )}
      </div>
   );

   if (fullScreen) {
      return (
         <div
            className={`fixed inset-0 flex items-center justify-center z-50 transition-colors duration-200 ${
               isDarkMode ? "bg-gray-900/95" : "bg-white/95"
            }`}
         >
            <div
               className={`p-8 rounded-lg shadow-lg border transition-colors duration-200 ${
                  isDarkMode
                     ? "bg-gray-800 border-gray-700"
                     : "bg-white border-gray-200"
               }`}
            >
               <LoaderContent />
            </div>
         </div>
      );
   }

   return <LoaderContent />;
};

// Specific loader variants for common use cases
export const PageLoader = ({ text = "Loading page..." }) => (
   <Loader size="large" text={text} fullScreen={true} />
);

export const SectionLoader = ({ text = "Loading..." }) => (
   <div className="flex items-center justify-center py-12">
      <Loader size="default" text={text} />
   </div>
);

export const ButtonLoader = ({ text = "" }) => (
   <Loader size="small" text={text} showText={!!text} />
);

export const InlineLoader = () => <Loader size="small" showText={false} />;

export default Loader;
