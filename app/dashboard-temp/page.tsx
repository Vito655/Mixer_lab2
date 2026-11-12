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

interface TemperatureAlert {
  message: string;
  temperature: number;
  sensorName: string;
  timestamp: string;
  severity: "critical" | "warning";
}

export default function DashboardTemp() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<TemperatureAlert[]>([]);

  // Використовуємо змінну середовища з .env або за замовчуванням URL на Render
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://magic-lab1.onrender.com";

  useEffect(() => {
    async function fetchData() {
      try {
        // Запит до NestJS API на роут /temperature-sensors
        const res = await fetch(`${apiUrl}/temperature-sensors`);
        if (!res.ok) throw new Error("Помилка завантаження даних");
        const data = await res.json();

        // Форматування та сортування за часом
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
        console.error("Fetching temp data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Оновлюємо дані кожні 10 секунд
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  // Підключення до потоку сповіщень (SSE)
  useEffect(() => {
    if (!apiUrl) return;

    const eventSource = new EventSource(`${apiUrl}/temperature-sensors/alerts`);

    eventSource.onmessage = (event) => {
      const alert: TemperatureAlert = JSON.parse(event.data);
      // Зберігаємо останні 5 сповіщень, нові додаємо на початок
      setAlerts((prev) => [alert, ...prev].slice(0, 5));
    };

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [apiUrl]);

  if (loading) return <p className="p-6 text-gray-300">Завантаження даних...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-100 flex items-center gap-2">
        Графік температурного сенсора
      </h1>

      {/* Блок вікон попереджень */}
      {alerts.length > 0 && (
        <div className="space-y-2 mb-6">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md"
              role="alert"
            >
              <p className="font-bold">⚠ {alert.message}</p>
              <p className="text-sm">
                Давач: {alert.sensorName} | Час:{" "}
                {new Date(alert.timestamp).toLocaleTimeString("uk-UA")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Блок з графіком */}
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-gray-800">
        <h2 className="text-lg font-medium mb-4">Sensor Temp-01 (°C)</h2>

        <div className="h-64 w-full">
          {readings.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              Немає доступних даних. Відправте POST-запит на /sensors через Postman.
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
                  dot={{ r: 4 }}
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
