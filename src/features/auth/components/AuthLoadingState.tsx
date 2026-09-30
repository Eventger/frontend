import { LoaderCircle } from 'lucide-react'

export function AuthLoadingState() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#f7f8fc]"
      aria-busy="true"
    >
      <p
        className="flex items-center gap-2 text-sm font-medium text-[#475467]"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <LoaderCircle
          className="size-4 animate-spin text-[#4f46e5]"
          aria-hidden="true"
        />
        Verificando tu sesión…
      </p>
    </main>
  )
}
