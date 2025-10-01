import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="brand">🍩 SugarDonuts</div>
      <nav>
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/page-one" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Página 1
            </NavLink>
          </li>
          <li>
            <NavLink to="/page-two" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
              Página 2
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
