// AQI Leaderboard Component (Dark Theme)
// - Shows top 10 cities with highest AQI
// - Purely fake/randomized data, regenerated on refresh
// - Modern, clean, no animations
// - Matches style of AQI Predictor (dark mode)

import React, { useState } from "react";

export default function AQILeaderboard() {
  const [cities] = useState(() => generateFakeAQI());

  function generateFakeAQI() {
    const cityList = [
      "Delhi",
      "Beijing",
      "Mumbai",
      "Los Angeles",
      "Dhaka",
      "Karachi",
      "Mexico City",
      "Cairo",
      "Jakarta",
      "Chennai",
      "São Paulo",
      "Istanbul",
      "Bangkok",
      "Lagos",
      "Tehran"
    ];

    const data = cityList.map((city) => {
      const aqi = Math.floor(Math.random() * 350) + 80; // range 80–430
      return {
        city,
        aqi,
        category: getAQICategory(aqi)
      };
    });

    return data
      .sort((a, b) => b.aqi - a.aqi)
      .slice(0, 10);
  }

  function getAQICategory(aqi) {
    if (aqi <= 50) return { name: "Good", color: "#2ecc71" };
    if (aqi <= 100) return { name: "Moderate", color: "#f1c40f" };
    if (aqi <= 150) return { name: "Unhealthy (SG)", color: "#e67e22" };
    if (aqi <= 200) return { name: "Unhealthy", color: "#e74c3c" };
    if (aqi <= 300) return { name: "Very Unhealthy", color: "#9b59b6" };
    return { name: "Hazardous", color: "#7f3f98" };
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-[#0d0d0d] text-gray-200 rounded-2xl border border-gray-800 shadow-md">
      <header className="mb-4">
        <h2 className="text-2xl font-semibold text-white">AQI Leaderboard</h2>
        <p className="text-sm text-gray-400 mt-1">Top 10 cities with highest AQI</p>
      </header>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-gray-400 border-b border-gray-800">
            <th className="py-2">Rank</th>
            <th>City</th>
            <th>AQI</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((c, i) => (
            <tr
              key={i}
              className="border-b border-gray-800 hover:bg-[#141414]"
            >
              <td className="py-3 text-gray-400">#{i + 1}</td>
              <td className="font-medium text-white">{c.city}</td>
              <td className="font-semibold">{c.aqi}</td>
              <td>
                <span
                  className="px-2 py-1 rounded-lg text-xs font-medium"
                  style={{ background: c.category.color + "20", color: c.category.color }}
                >
                  {c.category.name}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
