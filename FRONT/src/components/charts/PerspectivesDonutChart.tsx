"use client";

import { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { getPerspectiveColors } from "../../utils/perspectiveColors";

interface PerspectiveData {
  id: string;
  name: string;
  progress: number;
  weightage: number;
}

interface PerspectivesDonutChartProps {
  perspectives: PerspectiveData[];
  avgProgress: number;
}

export default function PerspectivesDonutChart({
  perspectives,
  avgProgress,
}: PerspectivesDonutChartProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    setIsDark(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  const trackColor = isDark ? "#374151" : "#E4E7EC";

  const chartData = useMemo(() => {
    const segments = perspectives.map((p) => ({
      name: p.name,
      value: p.progress * (p.weightage / 100),
      color: getPerspectiveColors(p.id).accent,
      id: p.id,
      progress: p.progress,
      weightage: p.weightage,
      isPendiente: false,
    }));

    const totalWeighted = segments.reduce((a, b) => a + b.value, 0);
    const pendienteValue = Math.max(0, 100 - totalWeighted);
    if (pendienteValue > 0) {
      segments.push({
        name: "Pendiente",
        value: pendienteValue,
        color: trackColor,
        id: "pendiente",
        progress: 0,
        weightage: 0,
        isPendiente: true,
      });
    }

    return segments;
  }, [perspectives, trackColor]);

  const textColor = isDark ? "#E5E7EB" : "#1F2937";
  const legendTextColor = isDark ? "#D1D5DB" : "#374151";

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-4">
      <div style={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[{ value: 100 }]}
              dataKey="value"
              innerRadius="60%"
              outerRadius="85%"
              startAngle={90}
              endAngle={450}
              stroke="none"
              isAnimationActive={false}
            >
              <Cell fill={trackColor} />
            </Pie>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius="60%"
              outerRadius="85%"
              startAngle={90}
              endAngle={450}
              paddingAngle={2}
              stroke="none"
              cornerRadius={4}
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                />
              ))}
            </Pie>
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="central"
              fill={textColor}
              fontSize={32}
              fontWeight={700}
              fontFamily="Outfit, sans-serif"
            >
              {avgProgress}%
            </text>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || payload.length === 0) return null;
                const data = payload[0].payload;
                if (data.isPendiente) return null;
                return (
                  <div
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 shadow-lg"
                    style={{ fontFamily: "Outfit, sans-serif", fontSize: 12 }}
                  >
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {data.name}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">
                      Progreso: {data.progress}% · Peso: {data.weightage}%
                    </p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-2">
        {perspectives.map((p) => (
          <div key={p.id} className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: legendTextColor }}>
            <span
              className="inline-block h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: getPerspectiveColors(p.id).accent }}
            />
            {p.name}: {p.progress}%
          </div>
        ))}
      </div>
    </div>
  );
}