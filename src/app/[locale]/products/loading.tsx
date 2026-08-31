export default function ProductsLoading() {
  return (
    <main className="container-page py-8">
      <div className="grid gap-7 lg:grid-cols-[1fr_330px]">
        <section>
          <div className="skeleton h-9 w-52 rounded" />
          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="rounded-md border border-stone-200 bg-white p-3">
                <div className="skeleton aspect-square rounded" />
                <div className="skeleton mt-4 h-4 w-5/6 rounded" />
                <div className="skeleton mt-3 h-4 w-1/2 rounded" />
                <div className="skeleton mt-4 h-10 rounded" />
              </div>
            ))}
          </div>
        </section>
        <aside className="hidden lg:block">
          <div className="skeleton h-[560px] rounded-md" />
        </aside>
      </div>
    </main>
  );
}
