import { SkeletonCard } from "@/components/ui/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-3xl space-y-6 p-6">
      <SkeletonCard className="h-64" />
      <SkeletonCard className="h-48" />
      <SkeletonCard className="h-32" />
    </div>
  );
}
