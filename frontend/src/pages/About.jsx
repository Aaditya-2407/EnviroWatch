import Navbar from "../components/Navbar";

export default function About() {
  const developers = [
    { name: "Piyush Kshirsagar", role: "ML Engineer" },
    { name: "Tushar Ramgirkar", role: "Frontend Developer" },
    { name: "Aaditya Kharat", role: "Backend Developer" },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-900 text-white px-6 py-12">
        <h1 className="text-4xl font-bold text-center mb-10">
          About <span className="text-green-400">EnviroWatch</span>
        </h1>

        {/* Overview Section */}
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">
            Project Overview
          </h2>
          <p className="text-gray-300 leading-7">
            EnviroWatch is an intelligent weather analytics and prediction
            system. It uses advanced machine learning models to forecast
            rainfall based on real meteorological data. The platform provides
            accurate predictions, interactive dashboards, trend analysis, and an
            easy-to-use interface for students, researchers, and the general
            public.
          </p>

          <p className="text-gray-300 leading-7 mt-4">
            The goal of EnviroWatch is to simplify climate insights, visualize
            changing weather patterns, and support decision-making with
            data-driven predictions.
          </p>
        </div>

        {/* Developers Section */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center text-green-400 mb-8">
            Meet the Developers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {developers.map((dev, index) => (
              <div
                key={index}
                className="bg-gray-800 p-6 rounded-2xl shadow-xl text-center
                         hover:scale-105 transition-transform duration-300"
              >
                <div
                  className="w-24 h-24 bg-green-500 rounded-full mx-auto mb-4 
                flex items-center justify-center text-3xl font-bold shadow-lg"
                >
                  {dev.name.charAt(0)}
                </div>
                <h3 className="text-xl font-semibold">{dev.name}</h3>
                <p className="text-gray-400 mt-1">{dev.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
