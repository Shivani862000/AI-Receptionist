export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050816] px-6 text-white">
      <div className="rounded-[2rem] border border-white/10 bg-white/6 p-10 text-center backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">404</p>
        <h1 className="mt-3 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-sm text-white/65">The page you are looking for does not exist.</p>
      </div>
    </main>
  );
}
