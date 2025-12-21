'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

type Animal = {
  name: string;
  adultImage: string;
  babyImage: string;
};

const animals: Animal[] = [
  { name: 'Cat', adultImage: '/cat-adult.jpg', babyImage: '/cat-baby.png' },
  { name: 'Dog', adultImage: '/dog-adult.png', babyImage: '/dog-baby.png' },
  { name: 'Rabbit', adultImage: '/rabbit-adult.png', babyImage: '/rabbit-baby.png' },
];

export default function Home() {
  const [progress, setProgress] = useState<{ [key: string]: number }>({
    Cat: 0,
    Dog: 0,
    Rabbit: 0,
  });
  const [isHolding, setIsHolding] = useState<{ [key: string]: boolean }>({
    Cat: false,
    Dog: false,
    Rabbit: false,
  });
  const intervalRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({
    Cat: null,
    Dog: null,
    Rabbit: null,
  });

  const TRANSFORMATION_DURATION = 2000; // 2 seconds to complete
  const UPDATE_INTERVAL = 16; // ~60fps

  const startTransformation = (animalName: string) => {
    if (progress[animalName] >= 100) return; // Already transformed

    setIsHolding((prev) => ({ ...prev, [animalName]: true }));

    const startTime = Date.now();
    const startProgress = progress[animalName];

    intervalRefs.current[animalName] = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(
        100,
        startProgress + (elapsed / TRANSFORMATION_DURATION) * (100 - startProgress)
      );

      setProgress((prev) => ({ ...prev, [animalName]: newProgress }));

      if (newProgress >= 100) {
        stopTransformation(animalName);
      }
    }, UPDATE_INTERVAL);
  };

  const stopTransformation = (animalName: string) => {
    if (intervalRefs.current[animalName]) {
      clearInterval(intervalRefs.current[animalName]!);
      intervalRefs.current[animalName] = null;
    }
    setIsHolding((prev) => ({ ...prev, [animalName]: false }));
  };

  const handleMouseDown = (animalName: string) => {
    startTransformation(animalName);
  };

  const handleMouseUp = (animalName: string) => {
    stopTransformation(animalName);
  };

  const handleMouseLeave = (animalName: string) => {
    stopTransformation(animalName);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(intervalRefs.current).forEach((interval) => {
        if (interval) clearInterval(interval);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Animal Transformation Game
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Wanna know how to turn an animal into a baby animal? Let&apos;s transform these animals!
            <br />
            <span className="text-lg text-gray-500 mt-2 block">
              Press and hold the button to see the magic happen! ✨
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {animals.map((animal) => {
            const currentProgress = progress[animal.name];
            const isComplete = currentProgress >= 100;

            return (
              <div
                key={animal.name}
                className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center space-y-6 transform transition-all hover:scale-105"
              >
                {/* Animal Image Container with Morphing Effect */}
                <div className="relative w-64 h-64 overflow-hidden rounded-xl bg-gray-100">
                  {/* Adult Image */}
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      opacity: 1 - currentProgress / 100,
                      transform: `scale(${1 - currentProgress * 0.15 / 100}) translateY(${currentProgress * 5 / 100}px)`,
                    }}
                  >
                    <Image
                      src={animal.adultImage}
                      alt={`${animal.name} adult`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  {/* Baby Image */}
                  <div
                    className="absolute inset-0 transition-all duration-300"
                    style={{
                      opacity: currentProgress / 100,
                      transform: `scale(${0.85 + currentProgress * 0.2 / 100}) translateY(${-currentProgress * 5 / 100}px)`,
                    }}
                  >
                    <Image
                      src={animal.babyImage}
                      alt={`${animal.name} baby`}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                {/* Animal Name */}
                <h2 className="text-2xl font-semibold text-gray-800">
                  {animal.name}
                </h2>

                {/* Progress Bar */}
                <div className="w-full max-w-xs">
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden shadow-inner relative">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 rounded-full transition-all duration-75 ease-linear relative overflow-hidden"
                      style={{ width: `${currentProgress}%` }}
                    >
                      {isHolding[animal.name] && (
                        <div className="absolute inset-0 bg-white opacity-30 animate-pulse" />
                      )}
                    </div>
                    {currentProgress > 0 && currentProgress < 100 && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-gray-700">
                          {Math.round(currentProgress)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Transform Button */}
                <button
                  onMouseDown={() => handleMouseDown(animal.name)}
                  onMouseUp={() => handleMouseUp(animal.name)}
                  onMouseLeave={() => handleMouseLeave(animal.name)}
                  onTouchStart={() => handleMouseDown(animal.name)}
                  onTouchEnd={() => handleMouseUp(animal.name)}
                  disabled={isComplete}
                  className={`
                    w-full max-w-xs py-4 px-6 rounded-xl font-semibold text-lg
                    transition-all duration-200 transform
                    ${
                      isComplete
                        ? 'bg-green-500 text-white cursor-not-allowed'
                        : isHolding[animal.name]
                        ? 'bg-purple-600 text-white scale-95 shadow-lg'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 active:scale-95 shadow-md hover:shadow-lg'
                    }
                    focus:outline-none focus:ring-4 focus:ring-purple-300
                  `}
                >
                  {isComplete ? (
                    <span className="flex items-center justify-center gap-2">
                      <span>✓</span> Transformation Complete!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isHolding[animal.name] ? (
                        <>
                          <span className="animate-spin">✨</span> Transforming...
                        </>
                      ) : (
                        <>
                          <span>✨</span> Press & Hold to Transform
                        </>
                      )}
                    </span>
                  )}
                </button>

                {/* Reset Button (appears when complete) */}
                {isComplete && (
                  <button
                    onClick={() => {
                      setProgress((prev) => ({ ...prev, [animal.name]: 0 }));
                      setIsHolding((prev) => ({ ...prev, [animal.name]: false }));
                    }}
                    className="w-full max-w-xs py-2 px-4 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition-colors"
                  >
                    Reset
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
