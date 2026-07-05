import { useState } from "react";
import PerspectivesDonutChart from "../../components/charts/PerspectivesDonutChart";
import ProgressTrendChart from "../../components/charts/ProgressTrendChart";
import StrategicCard from "../../components/Cards/StrategicCard";
import PageMeta from "../../components/common/PageMeta";
import SnapshotSelector from "../../components/common/SnapshotSelector";
import SnapshotBanner from "../../components/common/SnapshotBanner";
import { usePerspectives } from "../../hooks/usePerspectives";
import { useProgressTrend } from "../../hooks/useSnapshots";

export default function StrategicLinesTab() {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const { data, isLoading, error } = usePerspectives(selectedSnapshotId ?? undefined);
  const { data: trendData } = useProgressTrend();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-8 text-center text-red-500">Error cargando datos</div>;
  }

  const perspectives = data.perspectives.map((perspective) => {
    const totalWeightage = perspective.projects.reduce((acc, p) => acc + p.weightage, 0);
    const perspectiveProgress = perspective.projects.reduce((acc, project) => {
      const projectProgress = project.activities.length > 0
        ? project.activities.reduce((sum, act) => sum + act.progress, 0) / project.activities.length
        : 0;
      return acc + (projectProgress * (project.weightage / (totalWeightage || 1)));
    }, 0);

    return {
      id: perspective.id,
      name: perspective.name,
      objective: perspective.objective,
      weightage: perspective.weightage,
      progress: Math.round(perspectiveProgress),
      components: perspective.projects.map(p => ({
        name: p.name,
        progress: Math.round(p.activities.reduce((sum, act) => sum + act.progress, 0) / (p.activities.length || 1)),
      })),
    };
  });

  const totalPerspectiveWeightage = perspectives.reduce((a, p) => a + p.weightage, 0);
  const avgProgress = Math.round(
    perspectives.reduce(
      (a, p) => a + p.progress * (p.weightage / (totalPerspectiveWeightage || 1)),
      0,
    ),
  );

  return (
    <>
      <PageMeta
        title="Perspectivas | Balanced Scorecard"
        description="Panel principal de Perspectivas"
      />

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Perspectivas
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Perspectivas del Balanced Scorecard
            </p>
          </div>
          <SnapshotSelector
            selectedSnapshotId={selectedSnapshotId}
            onSnapshotChange={setSelectedSnapshotId}
          />
        </div>

        <SnapshotBanner isViewingSnapshot={!!selectedSnapshotId} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
          <PerspectivesDonutChart
            perspectives={perspectives}
            avgProgress={avgProgress}
          />
          <ProgressTrendChart trendData={trendData ?? []} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-2">
          {perspectives.map((line) => (
              <StrategicCard
                key={line.id}
                name={line.name}
                progress={line.progress}
                components={line.components}
                perspectiveId={line.id}
                weightage={line.weightage}
                objective={line.objective}
              />
            ))}
        </div>
      </div>
    </>
  );
}