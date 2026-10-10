import { useState } from "react";
import { computePerspectiveProgress, computeWeightedProgress } from "bsc-shared";
import PerspectivesDonutChart from "../../components/charts/PerspectivesDonutChart";
import ProgressTrendChart from "../../components/charts/ProgressTrendChart";
import StrategicCard from "../../components/Cards/StrategicCard";
import PageMeta from "../../components/common/PageMeta";
import QueryState from "../../components/common/QueryState";
import SnapshotSelector from "../../components/common/SnapshotSelector";
import SnapshotBanner from "../../components/common/SnapshotBanner";
import UpdatesHistory from "../../components/common/UpdatesHistory";
import { usePerspectives } from "../../hooks/usePerspectives";
import { useProgressTrend } from "../../hooks/useSnapshots";

export default function StrategicLinesTab() {
  const [selectedSnapshotId, setSelectedSnapshotId] = useState<string | null>(null);
  const { data, isLoading, error } = usePerspectives(selectedSnapshotId ?? undefined);
  const { data: trendData } = useProgressTrend();

  const perspectives = (data?.perspectives ?? []).map((perspective) => ({
    id: perspective.id,
    name: perspective.name,
    objective: perspective.objective,
    weightage: perspective.weightage,
    progress: Math.round(computePerspectiveProgress(perspective)),
    components: perspective.projects.map((p) => ({
      name: p.name,
      progress: Math.round(
        p.activities.reduce((sum, act) => sum + act.progress, 0) /
          (p.activities.length || 1),
      ),
    })),
  }));

  const avgProgress = data ? computeWeightedProgress(data.perspectives) : 0;

  return (
    <>
      <PageMeta
        title="Perspectivas | Balanced Scorecard"
        description="Panel principal de Perspectivas"
      />

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <QueryState isLoading={isLoading} isError={Boolean(error) || !data}>
          {data && (
            <>
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
                  avgProgress={Math.round(avgProgress)}
                />
                <ProgressTrendChart trendData={trendData ?? []} />
              </div>

              <div className="mb-8">
                <UpdatesHistory
                  key={selectedSnapshotId ?? "current"}
                  perspectives={data.perspectives}
                  snapshotId={selectedSnapshotId}
                />
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
            </>
          )}
        </QueryState>
      </div>
    </>
  );
}
