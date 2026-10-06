"use client";

import { useState } from "react";

export default function FishAnimationPage() {
  // Встановлюємо false, щоб за замовчуванням анімація була прихована
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
      <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 text-center max-w-md w-full">
        {/* Клікабельний заголовок */}
        <h1
          onClick={() => setIsVisible(!isVisible)}
          className="text-2xl font-bold text-gray-800 hover:text-blue-600 cursor-pointer select-none transition-colors mb-2"
        >
          Fish
        </h1>

        {/* Плеєр відео (відображається тільки якщо isVisible === true) */}
        {isVisible && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-black/5">
            <video
              src="/fish-spinning.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto mx-auto rounded-xl"
            >
              Ваш браузер не підтримує тег video.
            </video>
          </div>
        )}
      </div>
    </div>
  );
}