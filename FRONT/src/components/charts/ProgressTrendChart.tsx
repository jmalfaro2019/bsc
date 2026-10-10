import { useMemo } from "react";
import type { ReactNode } from "react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import type { ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { ProgressTrendPoint } from "../../services/bscService";
import { useChartTheme } from "../../hooks/useChartTheme";

interface ProgressTrendChartProps {
  trendData: ProgressTrendPoint[];
}

function formatXAxis(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-CO", { month: "short", day: "numeric" });
}

export default function ProgressTrendChart({ trendData }: ProgressTrendChartProps) {
  const { isDark } = useChartTheme();

  const textColor = isDark ? "#9CA3AF" : "#6B7280";
  const gridColor = isDark ? "#374151" : "#E5E7EB";

  const chartData = useMemo(() => {
    if (trendData.length === 0) return [];
    return trendData.map((point, index) => ({
      ...point,
      index,
      x: index,
      displayLabel: point.label || formatXAxis(point.date),
    }));
  }, [trendData]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-4 h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Guarda cortes mensuales para ver la tendencia
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900 p-4">
      <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
        Tendencia de Progreso
      </h3>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="displayLabel"
              tick={{ fontSize: 11, fill: textColor }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              interval={0}
              angle={chartData.length > 4 ? -30 : 0}
              textAnchor={chartData.length > 4 ? "end" : "middle"}
              height={chartData.length > 4 ? 50 : 30}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: textColor }}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
              tickFormatter={(v: ValueType) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1F2937" : "#fff",
                border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                borderRadius: "0.75rem",
                fontSize: 12,
                fontFamily: "Outfit, sans-serif",
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
              }}
              labelStyle={{ color: isDark ? "#D1D5DB" : "#374151" }}
              formatter={(value: ValueType | undefined) => [`${value ?? 0}%`, "Progreso"]}
              labelFormatter={(label: ReactNode): ReactNode => String(label ?? "")}
            />
            <Line
              type="monotone"
              dataKey="avgProgress"
              stroke="#465FF5"
              strokeWidth={2.5}
              dot={{ fill: "#465FF5", strokeWidth: 2, stroke: "#fff", r: 5 }}
              activeDot={{ fill: "#465FF5", strokeWidth: 2, stroke: "#fff", r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}