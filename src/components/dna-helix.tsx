"use client";

import { useMemo, useState, useEffect, useCallback } from "react";

// Color palette matching dna-charts.tsx
const COLORS = [
  "#E67E22", // Orange
  "#3498DB", // Blue
  "#2ECC71", // Green
  "#E74C3C", // Red
  "#9B59B6", // Purple
  "#1ABC9C", // Teal
  "#F39C12", // Yellow
  "#34495E", // Dark gray
];

interface GenreData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface DNAHelixProps {
  genres: Array<{ name: string; value: number }>;
  total: number;
  height?: number;
  animated?: boolean;
}

// Helix parameters
const AMPLITUDE = 35; // Horizontal oscillation width
const TOTAL_TURNS = 3.5; // Number of complete rotations
const RUNGS_PER_TURN = 10; // Base pairs per full rotation
const TOTAL_RUNGS = Math.floor(TOTAL_TURNS * RUNGS_PER_TURN);

// Calculate helix point at parameter t
function getHelixPoint(t: number, offset: number, phase: number) {
  const x = AMPLITUDE * Math.sin(t + offset + phase);
  const z = Math.cos(t + offset + phase); // Depth for 3D illusion
  return { x, z };
}

// Generate SVG path for backbone strand
function generateStrandPath(
  offset: number,
  phase: number,
  height: number,
  steps: number = 100
): string {
  const points: string[] = [];
  const totalRadians = TOTAL_TURNS * 2 * Math.PI;
  const yScale = height / totalRadians;

  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * totalRadians;
    const { x } = getHelixPoint(t, offset, phase);
    const svgX = 60 + x; // Center in viewBox
    const svgY = 10 + t * yScale;

    if (i === 0) {
      points.push(`M ${svgX.toFixed(2)} ${svgY.toFixed(2)}`);
    } else {
      points.push(`L ${svgX.toFixed(2)} ${svgY.toFixed(2)}`);
    }
  }

  return points.join(" ");
}

// Distribute genres across rungs with interleaving
function distributeGenresToRungs(genres: GenreData[]): GenreData[] {
  if (genres.length === 0) return [];

  // Calculate how many rungs each genre gets
  const rungAssignments: GenreData[] = [];
  let remainingRungs = TOTAL_RUNGS;

  genres.forEach((genre, index) => {
    const rungCount =
      index === genres.length - 1
        ? remainingRungs // Last genre gets remaining
        : Math.max(1, Math.round((genre.percentage / 100) * TOTAL_RUNGS));
    remainingRungs -= rungCount;

    for (let i = 0; i < rungCount && rungAssignments.length < TOTAL_RUNGS; i++) {
      rungAssignments.push(genre);
    }
  });

  // Interleave for visual distribution (round-robin from groups)
  const groups: Map<string, GenreData[]> = new Map();
  rungAssignments.forEach((rung) => {
    const group = groups.get(rung.name) || [];
    group.push(rung);
    groups.set(rung.name, group);
  });

  const result: GenreData[] = [];
  const groupArrays = Array.from(groups.values());
  let added = true;

  while (added && result.length < TOTAL_RUNGS) {
    added = false;
    for (const group of groupArrays) {
      if (group.length > 0 && result.length < TOTAL_RUNGS) {
        result.push(group.shift()!);
        added = true;
      }
    }
  }

  return result;
}

// Calculate rung geometry
function calculateRung(
  index: number,
  phase: number,
  height: number
): {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  z: number;
  opacity: number;
  strokeWidth: number;
} {
  const totalRadians = TOTAL_TURNS * 2 * Math.PI;
  const t = (index / TOTAL_RUNGS) * totalRadians;
  const yScale = height / totalRadians;

  const pointA = getHelixPoint(t, 0, phase);
  const pointB = getHelixPoint(t, Math.PI, phase);

  const x1 = 60 + pointA.x;
  const x2 = 60 + pointB.x;
  const y = 10 + t * yScale;

  // Average z for depth sorting
  const z = (pointA.z + pointB.z) / 2;

  // Depth-based styling
  const opacity = 0.3 + (z + 1) * 0.35; // Range: 0.3 to 1.0
  const strokeWidth = 2 + (z + 1) * 2; // Range: 2 to 6

  return { x1, y1: y, x2, y2: y, z, opacity, strokeWidth };
}

export function DNAHelix({
  genres,
  total,
  height = 280,
  animated = true,
}: DNAHelixProps) {
  const [phase, setPhase] = useState(0);
  const [hoveredGenre, setHoveredGenre] = useState<string | null>(null);

  // Animation loop
  useEffect(() => {
    if (!animated) return;

    let animationFrame: number;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // Complete rotation every 10 seconds
      const newPhase = (elapsed / 10000) * 2 * Math.PI;
      setPhase(newPhase % (2 * Math.PI));

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [animated]);

  // Process genres with colors and percentages
  const processedGenres = useMemo((): GenreData[] => {
    return genres.map((g, i) => ({
      ...g,
      color: COLORS[i % COLORS.length],
      percentage: total > 0 ? (g.value / total) * 100 : 0,
    }));
  }, [genres, total]);

  // Distribute genres to rungs
  const rungGenres = useMemo(
    () => distributeGenresToRungs(processedGenres),
    [processedGenres]
  );

  // Calculate all rungs
  const rungs = useMemo(() => {
    return rungGenres.map((genre, index) => ({
      ...calculateRung(index, phase, height - 20),
      genre,
      index,
    }));
  }, [rungGenres, phase, height]);

  // Separate rungs by depth
  const backRungs = rungs.filter((r) => r.z < 0);
  const frontRungs = rungs.filter((r) => r.z >= 0);

  // Generate strand paths
  const strandPathA = useMemo(
    () => generateStrandPath(0, phase, height - 20),
    [phase, height]
  );
  const strandPathB = useMemo(
    () => generateStrandPath(Math.PI, phase, height - 20),
    [phase, height]
  );

  const handleRungHover = useCallback((genreName: string | null) => {
    setHoveredGenre(genreName);
  }, []);

  if (genres.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No genre data
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 120 300"
        className="w-full max-w-[160px]"
        style={{ height: `${height}px` }}
      >
        {/* Back rungs (behind strands) */}
        <g>
          {backRungs.map((rung) => (
            <line
              key={`back-${rung.index}`}
              x1={rung.x1}
              y1={rung.y1}
              x2={rung.x2}
              y2={rung.y2}
              stroke={rung.genre.color}
              strokeWidth={rung.strokeWidth * 0.6}
              strokeOpacity={
                hoveredGenre === null || hoveredGenre === rung.genre.name
                  ? rung.opacity * 0.5
                  : rung.opacity * 0.15
              }
              strokeLinecap="round"
              className="transition-opacity duration-200"
            />
          ))}
        </g>

        {/* Backbone strands */}
        <path
          d={strandPathA}
          stroke="#6b7280"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          opacity={0.8}
        />
        <path
          d={strandPathB}
          stroke="#6b7280"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          opacity={0.8}
        />

        {/* Front rungs (in front of strands) */}
        <g>
          {frontRungs.map((rung) => (
            <line
              key={`front-${rung.index}`}
              x1={rung.x1}
              y1={rung.y1}
              x2={rung.x2}
              y2={rung.y2}
              stroke={rung.genre.color}
              strokeWidth={rung.strokeWidth}
              strokeOpacity={
                hoveredGenre === null || hoveredGenre === rung.genre.name
                  ? rung.opacity
                  : rung.opacity * 0.3
              }
              strokeLinecap="round"
              className="cursor-pointer transition-opacity duration-200"
              onMouseEnter={() => handleRungHover(rung.genre.name)}
              onMouseLeave={() => handleRungHover(null)}
            />
          ))}
        </g>

        {/* Invisible wider hit areas for better hover detection */}
        <g>
          {frontRungs.map((rung) => (
            <line
              key={`hit-${rung.index}`}
              x1={rung.x1}
              y1={rung.y1}
              x2={rung.x2}
              y2={rung.y2}
              stroke="transparent"
              strokeWidth={12}
              className="cursor-pointer"
              onMouseEnter={() => handleRungHover(rung.genre.name)}
              onMouseLeave={() => handleRungHover(null)}
            />
          ))}
        </g>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm">
        {processedGenres.slice(0, 6).map((genre) => (
          <div
            key={genre.name}
            className={`flex items-center gap-1.5 cursor-pointer transition-opacity duration-200 ${
              hoveredGenre !== null && hoveredGenre !== genre.name
                ? "opacity-40"
                : "opacity-100"
            }`}
            onMouseEnter={() => handleRungHover(genre.name)}
            onMouseLeave={() => handleRungHover(null)}
          >
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: genre.color }}
            />
            <span className="text-gray-700 truncate max-w-[100px]">
              {genre.name}
            </span>
            <span className="text-gray-400">
              {genre.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
