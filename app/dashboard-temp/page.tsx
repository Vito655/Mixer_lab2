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

export default function DashboardTemp() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);

  // Використовуємо змінну оточення або пряме посилання на NestJS бекенд
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://magic-lab1.onrender.com";

  useEffect(() => {
    async function fetchData() {
      try {
        // Ендпоінт для температури у вашому NestJS контролері — /sensors
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
          // Сортуємо за часом від найстаріших до найновіших
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

  if (loading) return <p className="p-6 text-gray-300">Завантаження даних...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-100 flex items-center gap-2">
        Графік сенсора температури 🌡️
      </h1>

      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-gray-800">
        <h2 className="text-lg font-medium mb-4">Sensor Temp-01 (°C)</h2>

        <div className="h-64 w-full">
          {readings.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Немає доступних даних. Відправте POST-запит через Postman.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={readings}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={true}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}