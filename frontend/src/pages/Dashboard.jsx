import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [trendData, setTrendData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/metrics");
      setMetrics(res.data);
    } catch (err) {
      console.log("Metrics fetch error:", err);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await axios.get("http://localhost:5000/trends");
      setTrendData(res.data);
    } catch (err) {
      console.log("Trend fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTrends();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
        <h1 className="text-4xl font-bold text-center mb-10">
          EnviroWatch <span className="text-green-400">Dashboard</span>
        </h1>

        {/* TOP CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            title="Today's Rain Probability"
            value={
              metrics?.rain_probability ? metrics.rain_probability + "%" : "--"
            }
          />

          <DashboardCard
            title="Avg Temperature"
            value={metrics?.avg_temp ? metrics.avg_temp + "°C" : "--"}
          />

          <DashboardCard
            title="Avg Humidity"
            value={metrics?.avg_humidity ? metrics.avg_humidity + "%" : "--"}
          />
        </div>

        {/* TREND GRAPH */}
        <div className="mt-12 bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Weather Trend</h2>

          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <XAxis dataKey="day" stroke="#ccc" />
                <YAxis stroke="#ccc" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#22c55e"
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400">Loading trend data...</p>
          )}
        </div>
      </div>
    </>
  );
}

// ----------------------
// Dashboard Card Component
// ----------------------
function DashboardCard({ title, value }) {
  return (
    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center">
      <h3 className="text-lg font-semibold text-gray-300">{title}</h3>
      <p className="text-3xl font-bold text-green-400 mt-2">{value}</p>
    </div>
  );
}
