import NavBar from "./navbar/navbar.jsx";
import { Outlet } from "react-router-dom";

export default function LayoutWithNav() {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
