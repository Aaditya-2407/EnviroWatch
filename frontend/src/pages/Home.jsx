import React from "react";
import { ArrowRight, BarChart3, Activity, ListOrdered, Brain, Wind } from "lucide-react";
import { Link } from "react-router-dom";

// New Home Landing Page — Fascinating Hero + Feature Introductions
// Clean, futuristic, no animations

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-gray-200">
      {/* HERO SECTION */}
      <header className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white">
          Air Quality Intelligence<br />
          <span className="text-[#4da6ff]">EarthWatch</span>
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          Get beautifully visualized, offline-friendly & ultra-intuitive insights about air quality.
          Explore live AQI, pollution trends, rankings, and deep statistics — all designed to be fast,
          modern and stunning.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link to="/liveAQI">
            <button className="px-6 py-3 rounded-xl bg-[#4da6ff] text-black font-semibold flex items-center gap-2">
              Explore Live AQI <ArrowRight size={18} />
            </button>
          </Link>
          <Link to="/statistics">
            <button className="px-6 py-3 rounded-xl border border-gray-700 font-semibold">
              View Statistics
            </button>
          </Link>
        </div>
      </header>

      {/* FEATURES SECTION */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-2 gap-10">
        {/* LIVE AQI */}
        <FeatureCard
          title="Live AQI"
          desc="Real-time (fake) but highly dynamic AQI tracking. Includes 30-day trend lines, detailed pollutant breakdowns & a futuristic visual experience."
          icon={<Activity className="w-8 h-8 text-[#4da6ff]" />}
          link="/liveAQI"
        />

        {/* LEADERBOARD */}
        <FeatureCard
          title="Leaderboard"
          desc="Ranking of top 10 most polluted cities — updated with realistic patterns. A clean table with highlight badges and AQI severity indicators."
          icon={<ListOrdered className="w-8 h-8 text-[#ff7b7b]" />}
          link="/leaderboard"
        />

        {/* STATISTICS */}
        <FeatureCard
          title="Statistics"
          desc="Advanced analytical view of Delhi’s pollution — 5+ graphs showcasing monthly AQI, pollutant composition, seasonal variations and more."
          icon={<BarChart3 className="w-8 h-8 text-[#8fffab]" />}
          link="/statistics"
        />

        {/* INSIGHTS */}
        <FeatureCard
          title="Predict"
          desc="Predict AQI of your location using ML model, which uses past data to predict future AQI values. May be inaccute sometimes but works well enough"
          icon={<Brain className="w-8 h-8 text-[#cfa6ff]" />}
          link="/predict"
        />
      </section>

      {/* BOTTOM CTA */}
      <div className="text-center pb-20">
        <Wind className="w-10 h-10 mx-auto text-gray-500" />
        <h2 className="mt-4 text-xl text-gray-300 font-medium">Breathe smarter. Know your air.</h2>
      </div>
    </div>
  );
}

function FeatureCard({ title, desc, icon, link }) {
  return (
    <Link to={link}>
      <div className="p-6 bg-[#111] rounded-2xl border border-gray-800 hover:border-gray-700 cursor-pointer">
        <div>{icon}</div>
        <h3 className="mt-4 text-2xl text-white font-semibold">{title}</h3>
        <p className="mt-2 text-gray-400 text-sm leading-relaxed">{desc}</p>
        <div className="mt-4 text-[#4da6ff] text-sm font-medium flex items-center gap-1">
          Explore <ArrowRight size={16} />
        </div>
      </div>
    </Link>
  );
}