type TodayErrorStateProps = {
  onRetry: () => void
}

export function TodayErrorState({
  onRetry,
}: TodayErrorStateProps) {
  return (
    <section
      role="alert"
      className="flex min-h-[280px] w-full flex-col items-center rounded-[12px] border border-[#dde2ea] bg-white px-6 text-center"
    >
      <div className="mt-[37px] flex size-16 items-center justify-center rounded-full bg-[#feeeec]">
        <span className="text-[28px] font-bold leading-none text-[#b42318]">
          !
        </span>
      </div>

      <h2 className="mt-[10px] text-[24px] font-semibold leading-[29px] text-[#17212b]">
        No pudimos cargar tus tareas
      </h2>

      <p className="mt-3 max-w-[660px] text-[14px] leading-5 text-[#667085]">
        Ocurrió un problema al cargar las prioridades de hoy. Intenta nuevamente.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-[38px] h-11 w-[170px] rounded-[8px] bg-[#4f46e5] text-[13px] font-semibold text-white transition-colors hover:bg-[#4338ca]"
      >
        Reintentar
      </button>
    </section>
  )
}
