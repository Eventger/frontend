export function AuthLoadingState() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#f7f8fc]"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="text-sm font-medium text-[#475467]">
        Verificando tu sesión…
      </p>
    </main>
  )
}
