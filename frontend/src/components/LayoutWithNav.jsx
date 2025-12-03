// Author: Abdelrahman Zeidan
//date: 2025-11-23
// description: This file contains the layout component that includes the navigation bar. So that the navbar appears on all pages.
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

