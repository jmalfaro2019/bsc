import PageMeta from "../../components/common/PageMeta";
import QueryState from "../../components/common/QueryState";
import ManualEntryCard from "../../components/dataEntry/ManualEntryCard";
import ImportCard from "../../components/dataEntry/ImportCard";
import SnapshotCard from "../../components/dataEntry/SnapshotCard";
import { usePerspectives } from "../../hooks/usePerspectives";

export default function DataEntryTab() {
  const { data, isLoading, error } = usePerspectives();

  return (
    <>
      <PageMeta
        title="Ingreso de Datos | Balanced Scorecard"
        description="Formulario para actualizar el avance de actividades"
      />

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Ingreso de Datos
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Actualice el progreso de las actividades del Balanced Scorecard
          </p>
        </div>

        <QueryState isLoading={isLoading} isError={Boolean(error) || !data}>
          {data && (
            <>
              <ManualEntryCard perspectives={data.perspectives} />
              <ImportCard perspectives={data.perspectives} />
              <SnapshotCard />
            </>
          )}
        </QueryState>
      </div>
    </>
  );
}
