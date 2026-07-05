interface SnapshotBannerProps {
  isViewingSnapshot: boolean;
}

export default function SnapshotBanner({ isViewingSnapshot }: SnapshotBannerProps) {
  if (!isViewingSnapshot) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-4 py-3 flex items-center gap-2">
      <svg className="w-5 h-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
      <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
        Viendo datos de un corte guardado. Los valores corresponden al momento en que se creó el corte, no a los datos actuales.
      </p>
    </div>
  );
}