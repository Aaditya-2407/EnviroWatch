import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Predict() {
  const [formData, setFormData] = useState({
    humidity: "",
    temperature: "",
    pressure: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePredict = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await axios.post("http://localhost:5000/predict", {
        humidity: parseFloat(formData.humidity),
        temperature: parseFloat(formData.temperature),
        pressure: parseFloat(formData.pressure),
      });

      setResult(res.data.prediction);
    } catch (error) {
      console.log(error);
      setError("Failed to fetch prediction. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center px-6 py-10">
        <h2 className="text-4xl font-bold mb-8">
          Rainfall <span className="text-green-400">Prediction</span>
        </h2>

        <div className="bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-xl">
          {/* INPUT FIELDS */}
          <div className="space-y-4 mb-6">
            <InputField
              label="Humidity (%)"
              name="humidity"
              value={formData.humidity}
              onChange={handleChange}
            />

            <InputField
              label="Temperature (°C)"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
            />

            <InputField
              label="Pressure (hPa)"
              name="pressure"
              value={formData.pressure}
              onChange={handleChange}
            />
          </div>

          {/* PREDICT BUTTON */}
          <button
            onClick={handlePredict}
            className="w-full bg-green-500 hover:bg-green-600 py-3 rounded-xl text-lg font-semibold"
          >
            {loading ? "Predicting..." : "Predict"}
          </button>

          {/* RESULTS */}
          {error && <p className="text-red-400 text-center mt-4">{error}</p>}

          {result !== null && (
            <div className="mt-6 p-4 bg-gray-700 rounded-xl text-center">
              <h3 className="text-xl font-bold">Prediction:</h3>
              <p className="text-green-400 text-3xl font-extrabold mt-2">
                {result}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ------------------------
// Reusable Input Component
// ------------------------
function InputField({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block mb-1 text-gray-300 font-semibold">{label}</label>
      <input
        type="number"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-3 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-green-400"
      />
    </div>
  );
}
