import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center grow px-6">
        
        <h2 className="text-5xl font-extrabold mb-6 leading-tight">
          AI-Powered Weather <span className="text-green-400">Prediction</span>
        </h2>

        <p className="text-gray-300 max-w-2xl text-lg mb-10">
          EnviroWatch uses advanced machine learning models to predict rainfall
          and visualize environmental data with precision.  
          Stay informed. Stay prepared.
        </p>

        {/* CTA Buttons */}
        <div className="flex space-x-6">
          <Link
            to="/predict"
            className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-xl text-lg font-semibold shadow-lg transition"
          >
            Predict Now
          </Link>

          <Link
            to="/dashboard"
            className="bg-gray-700 hover:bg-gray-600 px-8 py-3 rounded-xl text-lg font-semibold shadow-lg transition"
          >
            View Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center bg-gray-800 text-gray-400 text-sm">
        © {new Date().getFullYear()} EnviroWatch • Weather Intelligence System
      </footer>
    </div>
  );
}
