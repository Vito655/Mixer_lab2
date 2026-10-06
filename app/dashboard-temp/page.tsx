"use client";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Reading {
  time: string;
  value: number;
  rawTime: number;
}

export default function DashboardTempPage() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://magic-lab1.onrender.com";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${apiUrl}/sensors`);
        if (!res.ok) throw new Error("Error fetching data");
        const data = await res.json();

        const formatted = data
          .map((item: any) => ({
            rawTime: new Date(item.timestamp).getTime(),
            time: new Date(item.timestamp).toLocaleTimeString("uk-UA", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            value: Number(item.value),
          }))
          .sort((a: Reading, b: Reading) => a.rawTime - b.rawTime);

        setReadings(formatted);
      } catch (error) {
        console.error("Fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
        Графік сенсора температури 🌡️
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-slate-800 text-lg font-medium mb-4">
          Sensor Temperature-01 (°C)
        </h2>

        {loading ? (
          <div className="h-80 flex items-center justify-center text-slate-400">
            Завантаження даних...
          </div>
        ) : readings.length === 0 ? (
          <div className="h-80 flex items-center justify-center text-slate-400">
            Немає доступних даних
          </div>
        ) : (
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readings}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#64748b" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} stroke="#64748b" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}