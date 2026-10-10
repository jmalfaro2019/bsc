import { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import QueryState from "../../components/common/QueryState";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import PerspectiveFormModal from "../../components/admin/PerspectiveFormModal";
import ProjectFormModal from "../../components/admin/ProjectFormModal";
import ActivityFormModal from "../../components/admin/ActivityFormModal";
import {
  ChevronDownIcon,
  PencilIcon,
  PlusIcon,
  TrashBinIcon,
} from "../../icons";
import { usePerspectives } from "../../hooks/usePerspectives";
import {
  useDeleteActivity,
  useDeletePerspective,
  useDeleteProject,
} from "../../hooks/useStructureCrud";
import { getPerspectiveColors } from "../../utils/perspectiveColors";
import type { Activity, Perspective, Project } from "bsc-shared";

type ModalState =
  | { kind: "perspective"; perspective: Perspective | null }
  | { kind: "project"; perspectiveId: string; project: Project | null }
  | {
      kind: "activity";
      perspectiveId: string;
      projectId: string;
      activity: Activity | null;
    }
  | null;

interface ConfirmState {
  title: string;
  message: string;
  action: () => void;
}

const iconButtonClasses =
  "p-1.5 rounded-lg text-gray-400 dark:text-gray-500 transition-colors";
const editButtonClasses = `${iconButtonClasses} hover:text-brand-500 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800`;
const deleteButtonClasses = `${iconButtonClasses} hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800`;
const addButtonClasses =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors";

interface ProjectRowProps {
  project: Project;
  perspectiveId: string;
  onEditProject: () => void;
  onDeleteProject: () => void;
  onAddActivity: () => void;
  onEditActivity: (activity: Activity) => void;
  onDeleteActivity: (activity: Activity) => void;
}

function ProjectRow({
  project,
  perspectiveId,
  onEditProject,
  onDeleteProject,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: ProjectRowProps) {
  const [open, setOpen] = useState(true);
  const pColors = getPerspectiveColors(perspectiveId);

  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-800/80 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 dark:bg-gray-800/60">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 flex-1 min-w-0 text-left"
        >
          <ChevronDownIcon
            className={`w-4 h-4 shrink-0 text-gray-400 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
            {project.name}
          </span>
        </button>
        <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${pColors.badge}`}>
          {project.weightage}%
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          <button className={addButtonClasses} onClick={onAddActivity} title="Agregar actividad">
            <PlusIcon className="w-3.5 h-3.5" />
            Actividad
          </button>
          <button className={editButtonClasses} onClick={onEditProject} title="Editar proyecto">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button className={deleteButtonClasses} onClick={onDeleteProject} title="Eliminar proyecto">
            <TrashBinIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {open && (
        <div className="overflow-x-auto">
          {project.activities.length === 0 ? (
            <p className="px-4 py-3 text-xs text-gray-400 dark:text-gray-500 italic">
              Sin actividades
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  <th className="text-left px-4 py-2">Actividad</th>
                  <th className="text-center px-3 py-2 w-20">Pond.</th>
                  <th className="text-center px-3 py-2 w-20">Avance</th>
                  <th className="text-left px-3 py-2">Responsable</th>
                  <th className="text-left px-3 py-2">Cumplimiento</th>
                  <th className="text-right px-4 py-2 w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {project.activities.map((activity) => (
                  <tr key={activity.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-2.5 text-gray-800 dark:text-gray-200 font-medium">
                      {activity.name}
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-400 text-xs tabular-nums">
                      {activity.weightage}%
                    </td>
                    <td className="px-3 py-2.5 text-center text-gray-600 dark:text-gray-400 text-xs tabular-nums">
                      {activity.progress}%
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 text-xs">
                      {activity.responsibleProcess || "—"}
                    </td>
                    <td className="px-3 py-2.5 text-gray-500 dark:text-gray-400 text-xs">
                      {activity.complianceDate || "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-0.5">
                        <button
                          className={editButtonClasses}
                          onClick={() => onEditActivity(activity)}
                          title="Editar actividad"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          className={deleteButtonClasses}
                          onClick={() => onDeleteActivity(activity)}
                          title="Eliminar actividad"
                        >
                          <TrashBinIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

interface PerspectiveSectionProps {
  perspective: Perspective;
  onAddProject: () => void;
  onEditPerspective: () => void;
  onDeletePerspective: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (project: Project) => void;
  onAddActivity: (project: Project) => void;
  onEditActivity: (project: Project, activity: Activity) => void;
  onDeleteActivity: (project: Project, activity: Activity) => void;
}

function PerspectiveSection({
  perspective,
  onAddProject,
  onEditPerspective,
  onDeletePerspective,
  onEditProject,
  onDeleteProject,
  onAddActivity,
  onEditActivity,
  onDeleteActivity,
}: PerspectiveSectionProps) {
  const [open, setOpen] = useState(true);
  const pColors = getPerspectiveColors(perspective.id);

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200/60 dark:border-gray-700/60 bg-white dark:bg-gray-900">
      <div className={`h-1 ${pColors.bar}`} />
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <ChevronDownIcon
            className={`w-5 h-5 shrink-0 ${pColors.accentText} ${pColors.accentTextDark} transition-transform duration-300 ${open ? "" : "-rotate-90"}`}
          />
          <div className="min-w-0">
            <h3 className={`text-base font-bold ${pColors.accentText} ${pColors.accentTextDark} leading-snug truncate`}>
              {perspective.name}
            </h3>
            {perspective.objective && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                {perspective.objective}
              </p>
            )}
          </div>
        </button>
        <span className={`shrink-0 rounded-md px-2.5 py-1 text-xs font-semibold ${pColors.badge}`}>
          {perspective.weightage}% del BSC
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          <button className={addButtonClasses} onClick={onAddProject} title="Agregar proyecto">
            <PlusIcon className="w-3.5 h-3.5" />
            Proyecto
          </button>
          <button className={editButtonClasses} onClick={onEditPerspective} title="Editar perspectiva">
            <PencilIcon className="w-4 h-4" />
          </button>
          <button className={deleteButtonClasses} onClick={onDeletePerspective} title="Eliminar perspectiva">
            <TrashBinIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className={`grid transition-all duration-500 ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 flex flex-col gap-2">
            {perspective.projects.length === 0 && (
              <p className="px-2 py-2 text-xs text-gray-400 dark:text-gray-500 italic">
                Sin proyectos
              </p>
            )}
            {perspective.projects.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                perspectiveId={perspective.id}
                onEditProject={() => onEditProject(project)}
                onDeleteProject={() => onDeleteProject(project)}
                onAddActivity={() => onAddActivity(project)}
                onEditActivity={(activity) => onEditActivity(project, activity)}
                onDeleteActivity={(activity) => onDeleteActivity(project, activity)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StructurePage() {
  const { data, isLoading, error } = usePerspectives();
  const deletePerspective = useDeletePerspective();
  const deleteProject = useDeleteProject();
  const deleteActivity = useDeleteActivity();

  const [modal, setModal] = useState<ModalState>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const deletePending =
    deletePerspective.isPending || deleteProject.isPending || deleteActivity.isPending;

  return (
    <>
      <PageMeta
        title="Estructura | Balanced Scorecard"
        description="Administración de perspectivas, proyectos y actividades"
      />

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Estructura del BSC
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Gestione perspectivas, proyectos y actividades
            </p>
          </div>
          <button
            onClick={() => setModal({ kind: "perspective", perspective: null })}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-brand-500 hover:bg-brand-600 active:scale-[0.98] transition-all duration-200"
          >
            <PlusIcon className="w-4 h-4" />
            Nueva Perspectiva
          </button>
        </div>

        <QueryState isLoading={isLoading} isError={Boolean(error) || !data}>
          {data && (
            <div className="flex flex-col gap-5">
              {data.perspectives.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                  No hay perspectivas registradas
                </p>
              )}
              {data.perspectives.map((perspective) => (
                <PerspectiveSection
                  key={perspective.id}
                  perspective={perspective}
                  onAddProject={() =>
                    setModal({ kind: "project", perspectiveId: perspective.id, project: null })
                  }
                  onEditPerspective={() =>
                    setModal({ kind: "perspective", perspective })
                  }
                  onDeletePerspective={() =>
                    setConfirm({
                      title: "Eliminar perspectiva",
                      message: `¿Está seguro de eliminar "${perspective.name}"? Se eliminarán también sus proyectos y actividades.`,
                      action: () =>
                        deletePerspective.mutate(perspective.id, {
                          onSuccess: () => setConfirm(null),
                        }),
                    })
                  }
                  onEditProject={(project) =>
                    setModal({ kind: "project", perspectiveId: perspective.id, project })
                  }
                  onDeleteProject={(project) =>
                    setConfirm({
                      title: "Eliminar proyecto",
                      message: `¿Está seguro de eliminar "${project.name}"? Se eliminarán también sus actividades.`,
                      action: () =>
                        deleteProject.mutate(
                          { perspectiveId: perspective.id, projectId: project.id },
                          { onSuccess: () => setConfirm(null) },
                        ),
                    })
                  }
                  onAddActivity={(project) =>
                    setModal({
                      kind: "activity",
                      perspectiveId: perspective.id,
                      projectId: project.id,
                      activity: null,
                    })
                  }
                  onEditActivity={(project, activity) =>
                    setModal({
                      kind: "activity",
                      perspectiveId: perspective.id,
                      projectId: project.id,
                      activity,
                    })
                  }
                  onDeleteActivity={(project, activity) =>
                    setConfirm({
                      title: "Eliminar actividad",
                      message: `¿Está seguro de eliminar "${activity.name}"?`,
                      action: () =>
                        deleteActivity.mutate(
                          {
                            perspectiveId: perspective.id,
                            projectId: project.id,
                            activityId: activity.id,
                          },
                          { onSuccess: () => setConfirm(null) },
                        ),
                    })
                  }
                />
              ))}
            </div>
          )}
        </QueryState>

        {modal?.kind === "perspective" && (
          <PerspectiveFormModal
            perspective={modal.perspective}
            onClose={() => setModal(null)}
          />
        )}
        {modal?.kind === "project" && (
          <ProjectFormModal
            perspectiveId={modal.perspectiveId}
            project={modal.project}
            onClose={() => setModal(null)}
          />
        )}
        {modal?.kind === "activity" && (
          <ActivityFormModal
            perspectiveId={modal.perspectiveId}
            projectId={modal.projectId}
            activity={modal.activity}
            onClose={() => setModal(null)}
          />
        )}
        {confirm && (
          <ConfirmDialog
            isOpen
            title={confirm.title}
            message={confirm.message}
            isPending={deletePending}
            onConfirm={() => confirm.action()}
            onClose={() => setConfirm(null)}
          />
        )}
      </div>
    </>
  );
}
