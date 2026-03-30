import { Skeleton, SkeletonCard } from "@/components/ui/Skeleton";

export default function BlogLoading() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-20">
      <Skeleton className="h-10 w-24" />
      <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
        <SkeletonCard className="h-64" />
      </div>
    </div>
  );
}
