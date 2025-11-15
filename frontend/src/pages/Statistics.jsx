import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";

// --- Realistic AQI Data for Multiple Cities ---

const COLORS = ["#e74c3c", "#f39c12", "#9b59b6", "#3498db", "#1abc9c", "#95a5a6"];

// --- Helper function to create realistic, but dummy, hourly data based on a base AQI ---
const createHourlyAQI = (baseAQI, spikeFactor = 1.4, spikeRange = 60) =>
  Array.from({ length: 24 }).map((_, h) => ({
    hour: `${h}:00`,
    // Spikes during morning (6-10) and evening (18-22)
    aqi:
      h >= 6 && h <= 10
        ? baseAQI * spikeFactor + Math.floor(Math.random() * spikeRange)
        : h >= 18 && h <= 22
        ? baseAQI * spikeFactor + Math.floor(Math.random() * spikeRange)
        : baseAQI + Math.floor(Math.random() * (spikeRange / 2)),
  }));

const cityData = {
  // --- DELHI DATA (HIGH WINTER POLLUTION) ---
  Delhi: {
    monthlyAQI: [
      { month: "Jan", aqi: 345 },
      { month: "Feb", aqi: 290 },
      { month: "Mar", aqi: 240 },
      { month: "Apr", aqi: 210 },
      { month: "May", aqi: 225 },
      { month: "Jun", aqi: 180 },
      { month: "Jul", aqi: 160 }, // Monsoon low
      { month: "Aug", aqi: 170 }, // Monsoon low
      { month: "Sep", aqi: 220 },
      { month: "Oct", aqi: 310 },
      { month: "Nov", aqi: 380 }, // Winter spike
      { month: "Dec", aqi: 400 }, // Winter spike
    ],
    pollutionShare: [
      { name: "PM2.5", value: 52 },
      { name: "PM10", value: 30 },
      { name: "NO2", value: 8 },
      { name: "SO2", value: 3 },
      { name: "O3", value: 4 },
      { name: "CO", value: 3 },
    ],
    hourlyAQI: createHourlyAQI(200, 1.4, 80),
    weeklyAQI: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
      day: d,
      aqi: 280 + Math.floor(Math.random() * 120),
    })),
    severityIndex: [
      { pollutant: "PM2.5", severity: 95 },
      { pollutant: "PM10", severity: 80 },
      { pollutant: "NO2", severity: 65 },
      { pollutant: "SO2", severity: 40 },
      { pollutant: "O3", severity: 55 },
      { pollutant: "CO", severity: 35 },
    ],
  },

  // --- MUMBAI DATA (GENERALLY LOWER, MONSOON LOW, POST-MONSOON RISE) ---
  Mumbai: {
    monthlyAQI: [
      { month: "Jan", aqi: 180 },
      { month: "Feb", aqi: 165 },
      { month: "Mar", aqi: 140 },
      { month: "Apr", aqi: 130 },
      { month: "May", aqi: 110 },
      { month: "Jun", aqi: 75 }, // Heavy Monsoon low
      { month: "Jul", aqi: 60 }, // Heavy Monsoon low
      { month: "Aug", aqi: 70 }, // Heavy Monsoon low
      { month: "Sep", aqi: 100 },
      { month: "Oct", aqi: 130 },
      { month: "Nov", aqi: 160 },
      { month: "Dec", aqi: 190 },
    ],
    pollutionShare: [
      { name: "PM2.5", value: 40 },
      { name: "PM10", value: 35 },
      { name: "NO2", value: 10 },
      { name: "SO2", value: 5 },
      { name: "O3", value: 5 },
      { name: "CO", value: 5 },
    ],
    hourlyAQI: createHourlyAQI(120, 1.2, 50),
    weeklyAQI: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => ({
      day: d,
      aqi: 130 + Math.floor(Math.random() * 60),
    })),
    severityIndex: [
      { pollutant: "PM2.5", severity: 70 },
      { pollutant: "PM10", severity: 65 },
      { pollutant: "NO2", severity: 50 },
      { pollutant: "SO2", severity: 30 },
      { pollutant: "O3", severity: 45 },
      { pollutant: "CO", severity: 30 },
    ],
  },
};

const cityOptions = Object.keys(cityData);

export default function CityStatistics() {
  const [selectedCity, setSelectedCity] = useState("Delhi");

  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
  };

  const currentData = cityData[selectedCity];

  // Helper component for the dropdown style
  const CitySelector = () => (
    <div className="flex items-center space-x-4 mb-8">
      <label htmlFor="city-select" className="text-xl font-medium text-gray-400">
        Select City:
      </label>
      <select
        id="city-select"
        value={selectedCity}
        onChange={handleCityChange}
        className="px-4 py-2 bg-[#1a1a1c] border border-gray-700 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#e74c3c] appearance-none cursor-pointer"
      >
        {cityOptions.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  );

  // The main component render
  return (
    <div className="w-full max-w-7xl mx-auto p-10 text-white space-y-14 bg-[#0a0a0b] min-h-screen">
      <h1 className="text-4xl font-bold text-center tracking-wide pt-4">
        Air Quality Statistics
      </h1>

      <CitySelector />

      {/* 1. Monthly AQI Trend (Line Chart) */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 text-gray-300 border-b border-gray-800 pb-2">
          Monthly AQI Trend
        </h2>
        <div className="h-72 bg-[#0d0d0e] rounded-2xl p-4 border border-gray-700 shadow-xl">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={currentData.monthlyAQI}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3e50" />
              <XAxis dataKey="month" stroke="#95a5a6" />
              <YAxis stroke="#95a5a6" domain={[0, 450]} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1c1c1e", border: "1px solid #34495e" }}
              />
              <Line
                type="monotone"
                dataKey="aqi"
                stroke="#e74c3c"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 2. Pollution Composition (Pie Chart) */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 text-gray-300 border-b border-gray-800 pb-2">
          Pollution Composition (%)
        </h2>
        <div className="h-80 bg-[#0d0d0e] rounded-2xl p-4 border border-gray-700 shadow-xl flex items-center justify-center">
          <ResponsiveContainer width="60%" height="100%">
            <PieChart>
              <Pie
                data={currentData.pollutionShare}
                cx="50%"
                cy="50%"
                outerRadius={110}
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                dataKey="value"
              >
                {currentData.pollutionShare.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: "#1c1c1e", border: "1px solid #34495e" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. Hourly AQI Pattern (Area Chart) */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 text-gray-300 border-b border-gray-800 pb-2">
          Hourly AQI Pattern (24h)
        </h2>
        <div className="h-72 bg-[#0d0d0e] rounded-2xl p-4 border border-gray-700 shadow-xl">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={currentData.hourlyAQI}>
              <defs>
                <linearGradient id="colorAQI" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#95a5a6" />
              <YAxis stroke="#95a5a6" />
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3e50" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1c1c1e", border: "1px solid #34495e" }}
              />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke="#e74c3c"
                fillOpacity={1}
                fill="url(#colorAQI)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. Weekly AQI Bars */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 text-gray-300 border-b border-gray-800 pb-2">
          Weekly AQI Averages
        </h2>
        <div className="h-64 bg-[#0d0d0e] rounded-2xl p-4 border border-gray-700 shadow-xl">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentData.weeklyAQI}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3e50" />
              <XAxis dataKey="day" stroke="#95a5a6" />
              <YAxis stroke="#95a5a6" />
              <Tooltip
                contentStyle={{ backgroundColor: "#1c1c1e", border: "1px solid #34495e" }}
              />
              <Bar dataKey="aqi" fill="#f39c12" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 5. Pollutant Severity Radar */}
      <section>
        <h2 className="text-2xl font-semibold mb-3 text-gray-300 border-b border-gray-800 pb-2">
          Pollutant Severity Index (0-100)
        </h2>
        <div className="h-80 bg-[#0d0d0e] rounded-2xl p-6 border border-gray-700 shadow-xl">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={currentData.severityIndex}>
              <PolarGrid stroke="#2c3e50" />
              <PolarAngleAxis dataKey="pollutant" stroke="#95a5a6" />
              <Radar
                name="Severity"
                dataKey="severity"
                stroke="#9b59b6"
                fill="#9b59b6"
                fillOpacity={0.6}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1c1c1e", border: "1px solid #34495e" }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}