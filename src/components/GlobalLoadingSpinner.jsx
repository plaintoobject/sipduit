export function GlobalLoadingSpinner() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex items-center space-x-3">
        <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:0s]"></div>
        <div className="bg-muted-foreground h-2 w-2 animate-bounce rounded-full [animation-delay:0.3s]"></div>
        <div className="bg-muted-foreground h-2 w-2 animate-pulse rounded-full [animation-delay:0.6s]"></div>
      </div>
    </div>
  );
}
