import React from 'react';

export default function HeroVideo() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
        src="/papar-background.mp4"
      />
      {/* Subtle dark blue/black overlay so white text remains clearly readable */}
      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[1px]" />
    </div>
  );
}
