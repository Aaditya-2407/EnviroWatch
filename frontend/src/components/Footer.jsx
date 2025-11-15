import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full mt-20 py-8 bg-[#0b0b0c] border-t border-gray-800 text-gray-400">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">

        <div className="flex flex-col gap-2">
          <h3 className="text-gray-300 font-semibold mb-1">Navigation</h3>
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link to="/predict" className="hover:text-white">Predict AQI</Link>
          <Link to="/leaderboard" className="hover:text-white">Leaderboard</Link>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-gray-300 font-semibold mb-1">AQI Tools</h3>
          <Link to="/liveAQI" className="hover:text-white">Live AQI</Link>
          <Link to="/statistics" className="hover:text-white">Statistics</Link>
          <Link to="/insights" className="hover:text-white">Insights</Link>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-gray-300 font-semibold mb-1">About</h3>
          <Link to="/about" className="hover:text-white">About Us</Link>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-gray-300 font-semibold mb-1">Project</h3>
          <p className="text-gray-500">AQI Monitoring System</p>
          <p className="text-gray-500">© {new Date().getFullYear()}</p>
        </div>

      </div>
    </footer>
  );
}
