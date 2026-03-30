import { Skeleton, SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";

export default function TransactionDetailLoading() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="mb-2 h-6 w-40" />
      <Skeleton className="h-8 w-96" />
      <div className="mt-2 flex gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-40" />
        <SkeletonCard className="h-40" />
      </div>
    </div>
  );
}
