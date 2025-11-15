// Dark theme version of AQI Predictor
// Converted design to dark mode colors

import React, { useState } from "react";
import { MapPin, Locate, Eraser } from "lucide-react";

export default function AQIPredictor() {
  const [location, setLocation] = useState("");
  const [coords, setCoords] = useState(null);
  const [datetime, setDatetime] = useState(() => {
    const now = new Date();
    now.setSeconds(0, 0);
    const tzOffset = now.getTimezoneOffset();
    const localISO = new Date(now.getTime() - tzOffset * 60000).toISOString().slice(0, 16);
    return localISO;
  });
  const [loadingGPS, setLoadingGPS] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  function fakePredict({ location, coords, datetime }) {
    const dt = datetime ? new Date(datetime) : new Date();
    const hour = dt.getHours();
    const month = dt.getMonth() + 1;

    let score = 50;
    if (hour >= 7 && hour <= 9) score += 60;
    if (hour >= 17 && hour <= 19) score += 70;
    if (month === 12 || month <= 2) score += 40;
    if (month >= 6 && month <= 8) score -= 10;

    if (location) {
      const sumChars = location.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
      score += (sumChars % 100) - 50;
    }

    if (coords) {
      const { lat, lon } = coords;
      const latFactor = Math.abs(lat) % 10;
      const lonFactor = Math.abs(lon) % 10;
      score += Math.round((latFactor + lonFactor) * 3);
    }

    const seed = Math.floor(dt.getTime() / 3600000);
    const noise = ((seed * 9301 + 49297) % 233280) / 233280;
    score += Math.round((noise - 0.5) * 80);

    let aqi = Math.max(0, Math.min(500, Math.round(score)));
    const category = getAQICategory(aqi);

    return { aqi, category };
  }

  function getAQICategory(aqi) {
    if (aqi <= 50) return { name: "Good", color: "#2ecc71", desc: "Air quality is satisfactory." };
    if (aqi <= 100) return { name: "Moderate", color: "#f1c40f", desc: "Acceptable for most." };
    if (aqi <= 150) return { name: "Unhealthy for Sensitive Groups", color: "#e67e22", desc: "Sensitive should limit exertion." };
    if (aqi <= 200) return { name: "Unhealthy", color: "#e74c3c", desc: "Everyone may feel effects." };
    if (aqi <= 300) return { name: "Very Unhealthy", color: "#9b59b6", desc: "Health alert level." };
    return { name: "Hazardous", color: "#7f3f98", desc: "Emergency conditions." };
  }

  function handleUseGPS() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported.");
      return;
    }
    setLoadingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lon = parseFloat(pos.coords.longitude.toFixed(6));
        setCoords({ lat, lon });
        setLocation(`${lat}, ${lon}`);
        setLoadingGPS(false);
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoadingGPS(false);
      },
      { timeout: 10000 }
    );
  }

  function handleClearGPS() {
    setCoords(null);
    setLocation("");
  }

  function handlePredict(e) {
    e.preventDefault();
    setError("");
    if (!location && !coords) {
      setError("Please enter a location or use GPS.");
      return;
    }
    if (!datetime) {
      setError("Please select date & time.");
      return;
    }
    const res = fakePredict({ location, coords, datetime });
    setResult(res);
  }

  return (
    <div className="max-w-3xl mt-10 mx-auto p-6 bg-[#0d0d0d] rounded-2xl shadow-md border border-gray-800 text-gray-200">
      <header className="flex items-start gap-4">
        <div className="shrink-0 bg-[#1a1a1a] p-3 rounded-xl border border-gray-700">
          <MapPin className="h-7 w-7 text-gray-300" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">AQI Predictor</h1>
          <p className="text-sm text-gray-400 mt-1">Predict AQI at your area</p>
        </div>
      </header>

      <form className="mt-6 grid grid-cols-1 gap-4" onSubmit={handlePredict}>
        <label className="text-sm text-gray-400">Location</label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="City"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-xl text-gray-200 outline-none placeholder-gray-500"
          />
          <button
            type="button"
            onClick={handleUseGPS}
            className="px-3 py-2 border border-gray-700 rounded-xl bg-[#141414] text-gray-200 hover:bg-[#1f1f1f]"
          >
            <Locate size={17} />
          </button>
          <button
            type="button"
            onClick={handleClearGPS}
            className="px-3 py-2 border border-gray-700 rounded-xl bg-[#141414] hover:bg-[#1f1f1f]"
          >
            <Eraser className="w-4 h-4 text-gray-200" />
          </button>
        </div>

        <div>
          <label className="text-sm text-gray-400">Date & Time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className="w-full mt-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 rounded-xl text-gray-200 outline-none"
          />
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <div className="flex gap-3 mt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2 rounded-xl bg-white text-black font-medium hover:opacity-90"
          >
            Predict AQI
          </button>
          <button
            type="button"
            onClick={() => { setResult(null); setError(""); }}
            className="px-4 py-2 rounded-xl border border-gray-700 bg-[#141414] text-gray-200"
          >
            Reset
          </button>
        </div>
      </form>

      {result && (
        <section className="mt-6 bg-[#141414] p-4 rounded-xl border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Predicted AQI</div>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-white">{result.aqi}</span>
                <span className="text-sm font-medium" style={{ color: result.category.color }}>
                  {result.category.name}
                </span>
              </div>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div>{coords ? `Coords: ${coords.lat}, ${coords.lon}` : location}</div>
              <div className="mt-1">{new Date(datetime).toLocaleString()}</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <div className="text-sm text-gray-400">Interpretation</div>
              <div className="mt-1 text-sm text-gray-500">{result.category.desc}</div>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <div className="text-sm text-gray-400">Advice</div>
              <div className="mt-1 text-sm text-gray-300 text-right">{getAdvice(result.aqi)}</div>
            </div>
          </div>

          <div className="mt-4 h-3 w-full rounded-full bg-[#0d0d0d] border border-gray-700">
            <div
              className="h-3 rounded-full"
              style={{ width: `${Math.min(100, (result.aqi / 500) * 100)}%`, background: result.category.color }}
            />
          </div>
        </section>
      )}
    </div>
  );

  function getAdvice(aqi) {
    if (aqi <= 50) return "Enjoy outdoor activities.";
    if (aqi <= 100) return "Sensitive people should pay attention.";
    if (aqi <= 150) return "Limit long outdoor exertion for sensitive groups.";
    if (aqi <= 200) return "Reduce prolonged or heavy outdoor exertion.";
    if (aqi <= 300) return "Avoid outdoor activities; consider masks and filters.";
    return "Avoid all outdoor exertion; follow local health guidance.";
  }
}
