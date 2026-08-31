export default function LocaleLoading() {
  return (
    <main className="container-page py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="skeleton h-10 w-64 rounded" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="rounded-md border border-stone-200 bg-white p-3">
                <div className="skeleton aspect-square rounded" />
                <div className="skeleton mt-4 h-4 w-5/6 rounded" />
                <div className="skeleton mt-3 h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        </section>
        <aside className="hidden lg:block">
          <div className="skeleton h-96 rounded-md" />
        </aside>
      </div>
    </main>
  );
}
