import { useEffect, useState } from "react";

type Weather = {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
};

function App() {
  const [data, setData] = useState<Weather[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:5062/weatherforecast")
      .then((res) => res.json())
      .then((json: Weather[]) => setData(json))
      .catch(() => setError("Failed to fetch from API"));
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>React + .NET Connected 🚀</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {data.map((item, index) => (
        <div key={index}>
          <p>
            {item.date} — {item.summary} — {item.temperatureC}°C
          </p>
        </div>
      ))}
    </div>
  );
}

export default App;
