// src/App.jsx
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import Favorite from "./pages/Favorite";
import { useEffect } from "react";
import { useCrawlStore } from "./stores/useCrawlStore";

export default function App() {
  const syncFavorites = useCrawlStore((state) => state.syncFavorites);

  useEffect(() => {
    syncFavorites();
  }, []);

  return (
    <div className="min-h-screen text-gray-800 max-w-full mx-auto px-4 py-8 bg-[#f8f5ef]">
      <nav className="p-4 flex gap-4 border-b">
        <NavLink
          to="/"
          className={({ isActive }) => (isActive ? "font-bold" : "")}
        >
          Main
        </NavLink>
        <NavLink
          to="/favorite"
          className={({ isActive }) => (isActive ? "font-bold" : "")}
        >
          Favorites
        </NavLink>
      </nav>

      <main className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favorite" element={<Favorite />} />
        </Routes>
      </main>
    </div>
  );
}
