// src/App.jsx
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Favorite from "./pages/Favorite";

export default function App() {
  return (
    <div className="min-h-screen text-gray-800 max-w-6xl mx-auto px-4 py-8 bg-[#f8f5ef]">
      <nav className="p-4 flex gap-4 border-b">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "font-bold" : "")}
        >
          메인
        </NavLink>
        <NavLink
          to="/favorite"
          className={({ isActive }) => (isActive ? "font-bold" : "")}
        >
          최애탭
        </NavLink>
      </nav>

      <main className="p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorite" element={<Favorite />} />
        </Routes>
      </main>
    </div>
  );
}
