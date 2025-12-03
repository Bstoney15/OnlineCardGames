// Author: Abdelrahman Zeidan
//date: 2025-11-23
import NavBar from "./navbar/navbar.jsx";
import { Outlet } from "react-router-dom";

// Wraps each page with the shared navigation bar
export default function LayoutWithNav() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}

