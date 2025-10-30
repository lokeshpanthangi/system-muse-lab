export function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg p-6 border border-border animate-pulse">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
          <div className="h-6 w-16 bg-muted rounded-full"></div>
        </div>
        
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded w-full"></div>
          <div className="h-3 bg-muted rounded w-5/6"></div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 bg-muted rounded"></div>
          <div className="h-6 w-24 bg-muted rounded"></div>
          <div className="h-6 w-16 bg-muted rounded"></div>
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 w-24 bg-muted rounded"></div>
          <div className="h-9 w-32 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}
