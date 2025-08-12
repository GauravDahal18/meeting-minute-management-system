import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header/Header.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import Footer from "../components/Footer/Footer.jsx";

const MainLayout = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Header showLogout={isAuthenticated} />
      <Outlet />
      <Footer/>
    </>
  );
};

export default MainLayout;
