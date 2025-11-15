import { LocateIcon } from "lucide-react";
import React, { useState, useEffect, useMemo } from "react";

// Hardcoded city for a dedicated dashboard
const DASHBOARD_CITY = "New Delhi"; // Changed city to a real one for context
const DASHBOARD_COUNTRY = "India";
const HISTORY_WINDOW = 30; // Fixed history to 30 cycles (representing days)

// Helper function to generate a single AQI value
const generateSingleAQI = (prev) => {
  // *** MODIFIED: Change only by -2 to +2 for smoother updates ***
  let change = Math.floor(Math.random() * 5) - 2; // -2, -1, 0, +1, +2
  let next = Math.max(40, Math.min(450, prev + change));
  return next;
};

// Function to generate the fixed 30-day historical data
const generateFixedHistory = (initialValue) => {
  let data = [];
  let currentAqi = initialValue;
  for (let i = 0; i < HISTORY_WINDOW; i++) {
    currentAqi = generateSingleAQI(currentAqi);
    data.push(currentAqi);
  }
  return data;
};

export default function LiveAQI() {
  // Use a slightly different initial value for live data to make it distinct
  const [aqi, setAqi] = useState(155);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 1. Initialize the history ONLY ONCE
  const [history] = useState(() => generateFixedHistory(170));
  const fixedHistoryForStats = history;

  const getCategory = (aqi) => {
    if (aqi <= 50) return { label: "OPTIMAL", color: "#2ecc71" };
    if (aqi <= 100) return { label: "MODERATE", color: "#f1c40f" };
    if (aqi <= 150) return { label: "ELEVATED", color: "#e67e22" };
    if (aqi <= 200) return { label: "CRITICAL", color: "#e74c3c" };
    if (aqi <= 300) return { label: "SEVERITY I", color: "#9b59b6" };
    return { label: "SEVERITY II", color: "#7f3f98" };
  };

  // 3. Update LIVE AQI every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAqi((prev) => {
        const next = generateSingleAQI(prev);
        setLastUpdate(new Date());
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const cat = getCategory(aqi);

  // Calculate stats using the fixed history data
  const stats = useMemo(() => {
    if (!fixedHistoryForStats.length) {
      return { min: aqi, max: aqi, avg: aqi };
    }
    const min = Math.min(...fixedHistoryForStats);
    const max = Math.max(...fixedHistoryForStats);
    const sum = fixedHistoryForStats.reduce((a, b) => a + b, 0);
    const totalCount = fixedHistoryForStats.length + 1;
    const avg = Math.round((sum + aqi) / totalCount);

    return { min, max, avg };
  }, [fixedHistoryForStats, aqi]);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-[#0c0c12] rounded-3xl border border-[#1f1f2a] text-gray-100 shadow-2xl transition-all duration-300">
      <style>{`
        .classy-font {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        
        .stat-card {
            transition: all 0.2s ease-out;
        }

        .stat-card:hover {
          background-color: #1a1a2a;
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
        }

        /* LIVE Ping Animation */
        @keyframes live-ping {
            0% {
                transform: scale(0.3);
                opacity: 1;
            }
            100% {
                transform: scale(1.5);
                opacity: 0;
            }
        }

        .live-indicator {
            position: relative;
            display: flex;
            align-items: center;
            font-size: 0.75rem;
            font-weight: 700;
            color: #ef4444; /* Red color */
        }

        .live-dot {
            width: 8px;
            height: 8px;
            background-color: #ef4444;
            border-radius: 50%;
            margin-right: 6px;
        }

        .live-ping {
            position: absolute;
            width: 8px;
            height: 8px;
            background-color: #ef4444;
            border-radius: 50%;
            animation: live-ping 1.5s infinite;
        }
      `}</style>

      <div className="classy-font">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 border-b border-[#252535] pb-4">
          <div>
            <h1 className="text-4xl font-extrabold text-[#7e85ff] tracking-tight">
              AQI METER
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Atmospheric Quality Surveillance System
            </p>
          </div>
          <div className="text-left md:text-right mt-4 md:mt-0">
            <h2 className="text-2xl font-semibold text-white tracking-wide flex items-center justify-end">
              {DASHBOARD_CITY}
            </h2>
            <p className="text-sm text-[#7e85ff] mt-1">{DASHBOARD_COUNTRY}</p>
          </div>
        </header>

        {/* Main Content Grid (Responsive) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Main AQI and History Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Data Panel */}
            <div className="p-6 bg-[#181825] rounded-xl border border-[#2a2a3a] flex flex-col sm:flex-row items-center justify-between shadow-xl">
              <div>
                <div className="text-base text-gray-400 uppercase tracking-widest flex items-center">
                  {/* Live Indicator with Ping */}
                  <span className="live-indicator mr-3">
                    <span className="live-dot animate-ping scale-75"></span>
                    LIVE
                  </span>
                </div>
                <div
                  className="aqi-number text-8xl font-bold mt-2 transition-colors duration-500"
                  style={{ color: cat.color }}
                >
                  {aqi}
                </div>
                <div
                  className="mt-4 inline-block px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wider"
                  style={{ background: cat.color + "33", color: cat.color }}
                >
                  Critical
                </div>
              </div>

              <div className="text-left sm:text-right text-sm text-gray-400 mt-6 sm:mt-0">
                <div className="text-xl text-white font-medium">
                  {DASHBOARD_CITY}
                </div>
                <div className="mt-2 text-xs">
                  LAST UPDATE: {lastUpdate.toLocaleTimeString()}
                </div>
                <div className="text-xs">
                  SYNC DATE: {lastUpdate.toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* History Chart */}
            <div className="mt-6 p-4 bg-[#181825] rounded-xl border border-[#2a2a3a] shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base text-gray-400 uppercase tracking-wider">
                  Last {HISTORY_WINDOW} Days
                </span>
                <span className="text-xs text-gray-600">
                  Data points: {fixedHistoryForStats.length}
                </span>
              </div>

              <div className="w-full h-48 bg-[#11111c] border border-[#2a2a3a] rounded-lg p-2 flex items-end gap-0.5 overflow-hidden">
                {fixedHistoryForStats.map((value, i) => (
                  <div
                    key={i}
                    className="history-bar flex-1 rounded-t-sm"
                    style={{
                      height: `${(value / 500) * 100}%`,
                      background: getCategory(value).color,
                      opacity: 0.9,
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3: Stats */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-lg font-semibold text-gray-300 uppercase tracking-wider border-b border-[#2a2a3a] pb-2 text-center">
              Today
            </h3>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 md:grid-cols-1 gap-4">
              <div className="stat-card p-5 bg-[#181825] rounded-xl border border-[#2a2a3a] text-center cursor-pointer">
                <div className="text-sm text-gray-500 uppercase tracking-wider">
                  HISTORY MIN
                </div>
                <div className="text-3xl font-bold text-[#2ecc71] mt-1">
                  {stats.min}
                </div>
              </div>

              <div className="stat-card p-5 bg-[#181825] rounded-xl border border-[#2a2a3a] text-center cursor-pointer">
                <div className="text-sm text-gray-500 uppercase tracking-wider">
                  HISTORY MAX
                </div>
                <div className="text-3xl font-bold text-[#e74c3c] mt-1">
                  {stats.max}
                </div>
              </div>

              <div className="stat-card p-5 bg-[#181825] rounded-xl border border-[#2a2a3a] text-center cursor-pointer">
                <div className="text-sm text-gray-500 uppercase tracking-wider">
                  AVG (30 DAYS + LIVE)
                </div>
                <div className="text-3xl font-bold text-[#f1c40f] mt-1">
                  {stats.avg}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
