"use client";

import { cn } from "@/lib/utils";

interface VinylRecordProps {
  size?: number;
  spinning?: boolean;
  className?: string;
  label?: string;
}

export function VinylRecord({
  size = 300,
  spinning = false,
  className,
  label = "DEEPCOGS",
}: VinylRecordProps) {
  return (
    <div
      className={cn(
        "relative",
        spinning && "animate-spin-slow",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 30% 30%,
              oklch(0.25 0.02 30) 0%,
              oklch(0.12 0.015 30) 50%,
              oklch(0.08 0.01 30) 100%
            )
          `,
          boxShadow: `
            inset 0 0 ${size * 0.05}px oklch(0.3 0.02 30),
            0 ${size * 0.02}px ${size * 0.1}px oklch(0 0 0 / 0.5),
            0 0 ${size * 0.15}px oklch(0.75 0.15 55 / 0.15)
          `,
        }}
      />

      {/* Grooves */}
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full border"
          style={{
            inset: `${8 + i * 3.2}%`,
            borderColor:
              i % 3 === 0
                ? "oklch(0.22 0.015 30)"
                : "oklch(0.18 0.015 30)",
            borderWidth: i % 5 === 0 ? "1px" : "0.5px",
          }}
        />
      ))}

      {/* Label area */}
      <div
        className="absolute rounded-full flex items-center justify-center"
        style={{
          inset: "35%",
          background: `
            radial-gradient(circle at 40% 40%,
              oklch(0.80 0.16 55) 0%,
              oklch(0.70 0.15 50) 50%,
              oklch(0.60 0.14 45) 100%
            )
          `,
          boxShadow: `
            inset 0 2px 4px oklch(1 0 0 / 0.2),
            inset 0 -2px 4px oklch(0 0 0 / 0.2)
          `,
        }}
      >
        <div className="text-center">
          <div
            className="font-bold tracking-wider"
            style={{
              fontSize: size * 0.055,
              color: "oklch(0.15 0.02 30)",
            }}
          >
            {label}
          </div>
          <div
            className="font-mono mt-1 opacity-70"
            style={{
              fontSize: size * 0.03,
              color: "oklch(0.25 0.02 30)",
            }}
          >
            33⅓ RPM
          </div>
        </div>
      </div>

      {/* Center hole */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "48%",
          background: "oklch(0.12 0.015 30)",
          boxShadow: "inset 0 2px 4px oklch(0 0 0 / 0.5)",
        }}
      />

      {/* Shine reflection */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          inset: "2%",
          background: `
            linear-gradient(
              135deg,
              oklch(1 0 0 / 0.08) 0%,
              transparent 40%,
              transparent 60%,
              oklch(1 0 0 / 0.03) 100%
            )
          `,
        }}
      />
    </div>
  );
}
