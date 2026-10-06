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
  
  // Якщо зміна оточення не задана, використовуємо прямий URL бекенду
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://magic-lab1.onrender.com";

  useEffect(() => {
    async function fetchData() {
      try {
        // Виправлено роут з /temperature-sensors на /sensors
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
          // Сортуємо від найстаріших записів до найновіших для правильного відображення осі X
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

  if (loading) return <p className="p-4 text-center">Завантаження даних...</p>;

  if (readings.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">Немає доступних даних для температури.</p>
        <p className="text-sm text-gray-400">Відправте кілька POST-запитів через Postman.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-96 p-4">
      <h2 className="text-xl font-semibold mb-4 text-center">Графік температури</h2>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={readings}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
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
  );
}