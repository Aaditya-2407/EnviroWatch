import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleMenu = () => setOpen(!open);

  return (
    <nav className="bg-gray-900 text-white w-full shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo / Title */}
        <Link to="/" className="text-2xl font-bold text-green-400">
          EnviroWatch
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 text-lg">
          <Link to="/" className="hover:text-green-400 transition">Home</Link>
          <Link to="/predict" className="hover:text-green-400 transition">Predict</Link>
          <Link to="/dashboard" className="hover:text-green-400 transition">Dashboard</Link>
          <Link to="/about" className="hover:text-green-400 transition">About</Link>
        </div>

        {/* Mobile Menu Icon */}
        <button onClick={toggleMenu} className="md:hidden">
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-gray-800 px-6 py-4 space-y-3 text-lg">
          <Link onClick={toggleMenu} to="/" className="block hover:text-green-400">Home</Link>
          <Link onClick={toggleMenu} to="/predict" className="block hover:text-green-400">Predict</Link>
          <Link onClick={toggleMenu} to="/dashboard" className="block hover:text-green-400">Dashboard</Link>
          <Link onClick={toggleMenu} to="/about" className="block hover:text-green-400">About</Link>
        </div>
      )}
    </nav>
  );
}
