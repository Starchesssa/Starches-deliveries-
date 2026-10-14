import React, { useEffect, useState } from 'react';
import { STARCHES_LOGO_URL } from '../constants/assets';

interface SplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

/**
 * Brand Launch Splash Screen
 * Displays the exact brand logo full screen for 1-3 seconds on app start,
 * then smoothly continues into the customer application.
 */
export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  durationMs = 2200,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Start fade out slightly before completion for smooth native-like exit
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(800, durationMs - 400));

    // Finish splash and continue to app
    const finishTimer = setTimeout(() => {
      onFinish();
    }, durationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [durationMs, onFinish]);

  const handleContinue = () => {
    setIsFadingOut(true);
    setTimeout(onFinish, 150);
  };

  return (
    <div
      onClick={handleContinue}
      role="banner"
      aria-label="Starches Brand Splash Screen"
      className={`fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer select-none overflow-hidden transition-opacity duration-400 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#FCFAED',
        width: '100vw',
        height: '100dvh',
      }}
    >
      {/* Full-Screen Brand Logo Image */}
      <img
        src={STARCHES_LOGO_URL}
        alt="Starches"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain pointer-events-none animate-in zoom-in-95 fade-in duration-500"
        style={{
          backgroundColor: '#FCFAED',
          maxHeight: '100dvh',
          maxWidth: '100vw',
        }}
      />
    </div>
  );
};
