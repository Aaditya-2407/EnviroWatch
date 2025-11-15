import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Predict from "./pages/Predict";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Leaderboard from "./pages/Leaderboard";
import LiveAQI from "./pages/LiveAQI";
import CityStatistics from "./pages/Statistics";
import Footer from "./components/Footer";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/liveAQI" element={<LiveAQI />} />
        <Route path="/statistics" element={<CityStatistics />} />
        <Route path="/insights" element={<>Insights</>} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
