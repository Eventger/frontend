import {
  CalendarDays,
  CheckSquare2,
  Users,
} from 'lucide-react'

export function AuthBrandPanel() {
  const days = Array.from(
    { length: 35 },
    (_, index) => index + 1,
  )

  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#3730a3] text-white lg:block lg:w-[57%]">
      <div className="absolute -left-[140px] -top-[180px] h-[520px] w-[520px] rounded-full bg-white/[0.04]" />

      <div className="absolute -bottom-[180px] right-[-120px] h-[520px] w-[520px] rounded-full bg-white/[0.04]" />

      <div className="relative z-10 flex min-h-screen flex-col px-[7vw] py-16">

        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-white">
            <CalendarDays
              size={29}
              strokeWidth={2.2}
              className="text-[#4f46e5]"
            />
          </div>

          <span className="text-[26px] font-semibold">
            Eventger
          </span>
        </div>


        <div className="mt-16 grid flex-1 grid-cols-[minmax(280px,350px)_1fr] gap-10">

          {/* Mensaje principal */}
          <div>
            <h1 className="text-[40px] font-bold leading-[1.2]">
              Convierte cada
              <br />
              evento en una
              <br />
              experiencia bien
              <br />
              organizada.
            </h1>

            <p className="mt-7 max-w-[340px] text-[16px] leading-6 text-white/80">
              Centraliza fechas, tareas y prioridades en un solo lugar para avanzar con claridad y sin perder tiempo.
            </p>
          </div>


          {/* Decoración visual */}
          <div className="relative hidden xl:block">

            <div className="absolute left-5 top-0 w-[258px] rotate-[5deg] rounded-[14px] border border-white/20 bg-white/[0.08] p-4">
              <p className="text-[13px] text-white/80">
                ★ Evento destacado
              </p>

              <p className="mt-2 text-[18px] font-semibold">
                Lanzamiento de producto
              </p>

              <p className="mt-2 text-[13px] text-white/75">
                Sáb, 12 de abr · 10:00 AM
              </p>
            </div>


            <div className="absolute left-[-20px] top-[120px] w-[290px] -rotate-[4deg] rounded-[14px] border border-white/20 bg-white/[0.08] p-5">

              <p className="text-center text-[17px] font-semibold">
                Abril 2026
              </p>

              <div className="mt-4 grid grid-cols-7 gap-2">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(
                  (day) => (
                    <span
                      key={day}
                      className="text-center text-[11px] text-white/70"
                    >
                      {day}
                    </span>
                  ),
                )}

                {days.map((day) => (
                  <div
                    key={day}
                    className={`flex h-6 w-6 items-center justify-center rounded-[6px] text-[10px] ${
                      day === 12
                        ? 'bg-white font-bold text-[#4f46e5]'
                        : 'bg-white/[0.08] text-white/70'
                    }`}
                  >
                    {day}
                  </div>
                ))}
              </div>
            </div>


            <div className="absolute right-2 top-[155px] rounded-[12px] border border-white/20 bg-white/[0.08] px-4 py-3">
              <p className="text-[11px] text-white/75">
                Tareas
              </p>
              <p className="text-[18px] font-semibold">
                3 / 5
              </p>
            </div>


            <div className="absolute right-2 top-[235px] rounded-[12px] border border-white/20 bg-white/[0.08] px-4 py-3">
              <p className="text-[11px] text-white/75">
                Progreso
              </p>
              <p className="text-[18px] font-semibold">
                80%
              </p>
            </div>

          </div>

        </div>


        {/* Beneficios */}
        <div className="space-y-5">

          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/20 bg-white/[0.08]">
              <CalendarDays size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Planifica
              </p>
              <p className="text-xs text-white/70">
                Todo en un solo lugar
              </p>
            </div>
          </div>


          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/20 bg-white/[0.08]">
              <CheckSquare2 size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Organiza
              </p>
              <p className="text-xs text-white/70">
                Mantén el control
              </p>
            </div>
          </div>


          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/20 bg-white/[0.08]">
              <Users size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold">
                Logra
              </p>
              <p className="text-xs text-white/70">
                Eventos memorables
              </p>
            </div>
          </div>

        </div>


        <p className="mt-12 text-[11px] text-white/50">
          © 2026 Eventger. Todos los derechos reservados.
        </p>

      </div>
    </aside>
  )
}