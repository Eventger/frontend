export function TodayPriorityGuide() {
  return (
    <aside className="rounded-[14px] border border-[#d9dee7] bg-white p-[18px]">
      <h2 className="text-lg font-bold text-[#17212b]">
        Cómo se ordena “Hoy”
      </h2>

      <p className="mt-3 text-[13px] leading-5 text-[#667085]">
        La prioridad no depende solo
        del color. Cada gestión indica
        su estado y el motivo.
      </p>

      <div className="mt-4 space-y-5">
        <div>
          <span className="inline-flex rounded-full bg-[#fef3f2] px-3 py-[6px] text-xs font-semibold text-[#b42318]">
            Vencida
          </span>

          <p className="mt-2 text-xs leading-5 text-[#17212b]">
            Plazo superado. Atiéndela
            primero.
          </p>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-[#fffaeb] px-3 py-[6px] text-xs font-semibold text-[#b54708]">
            Hoy
          </span>

          <p className="mt-2 text-xs leading-5 text-[#17212b]">
            Vence antes de terminar el
            día.
          </p>
        </div>

        <div>
          <span className="inline-flex rounded-full bg-[#eff8ff] px-3 py-[6px] text-xs font-semibold text-[#175cd3]">
            Próxima
          </span>

          <p className="mt-2 text-xs leading-5 text-[#17212b]">
            Vence pronto
          </p>
        </div>
      </div>
    </aside>
  )
}