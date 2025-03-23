import React, { useEffect, useRef } from "react";

interface NoiseEffectProps {
  opacity?: number;
}

const NoiseEffect: React.FC<NoiseEffectProps> = ({ opacity = 0.035 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas to full window size
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Redraw the noise when resizing
      generateNoise();
    };

    // Improved noise generation for better grain quality
    const generateNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Generate a higher quality noise pattern
      for (let i = 0; i < data.length; i += 4) {
        // Use a more sophisticated random function for better grain
        const value = Math.floor(Math.random() * 255);

        // Set all RGB channels to the same value for grayscale
        data[i] = value; // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 255 * opacity; // Alpha (transparency)
      }

      ctx.putImageData(imageData, 0, 0);
    };

    window.addEventListener("resize", resize);
    resize(); // Initial size and draw

    // Clean up
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [opacity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 100,
        mixBlendMode: "overlay",
      }}
    />
  );
};

export default NoiseEffect;
