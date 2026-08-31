export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-9 w-72 animate-pulse rounded bg-stone-200" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded-md border border-stone-200 bg-white p-3">
            <div className="aspect-square animate-pulse rounded bg-stone-200" />
            <div className="mt-4 h-4 w-4/5 animate-pulse rounded bg-stone-200" />
            <div className="mt-3 h-4 w-1/2 animate-pulse rounded bg-stone-200" />
          </div>
        ))}
      </div>
    </main>
  );
}
