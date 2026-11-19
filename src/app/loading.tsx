export default function Loading() {
  return (
    <div className="container-lc max-w-xl animate-pulse py-10">
      <div className="h-6 w-32 rounded bg-surface2" />
      <div className="mt-4 h-9 w-3/4 rounded bg-surface2" />
      <div className="mt-2 h-4 w-1/2 rounded bg-surface2" />
      <div className="mt-8 space-y-2">
        <div className="h-16 rounded-2xl bg-surface2" />
        <div className="h-16 rounded-2xl bg-surface2" />
        <div className="h-16 rounded-2xl bg-surface2" />
      </div>
    </div>
  );
}
