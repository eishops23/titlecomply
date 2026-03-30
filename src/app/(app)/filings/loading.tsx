import { Skeleton, SkeletonTable } from "@/components/ui/Skeleton";

export default function FilingsLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-8 w-24" />
      <SkeletonTable rows={6} cols={5} />
    </div>
  );
}
