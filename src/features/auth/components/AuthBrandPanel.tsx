import calendarIcon from '@/assets/auth/calendar.svg'
import checklistIcon from '@/assets/auth/checklist.svg'
import glowBottom from '@/assets/auth/glow-bottom.svg'
import glowTop from '@/assets/auth/glow-top.svg'
import peopleIcon from '@/assets/auth/people.svg'
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark'
import { Star } from 'lucide-react'

const benefits = [
  {
    icon: calendarIcon,
    title: 'Planifica',
    description: 'Todo en un solo lugar',
  },
  {
    icon: checklistIcon,
    title: 'Organiza',
    description: 'Mantén el control',
  },
  {
    icon: peopleIcon,
    title: 'Logra',
    description: 'Eventos memorables',
  },
]

const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const days = Array.from({ length: 35 }, (_, index) => index + 1)

export function AuthBrandPanel() {
  return (
    <aside className="relative hidden min-h-svh overflow-hidden bg-[#3730a3] text-white lg:block lg:w-[57%] lg:max-w-[820px] lg:shrink-0 lg:self-stretch">
      <img
        src={glowTop}
        alt=""
        className="pointer-events-none absolute -left-[140px] -top-[180px] h-[520px] w-[520px]"
      />
      <img
        src={glowBottom}
        alt=""
        className="pointer-events-none absolute -bottom-[180px] right-[-120px] h-[520px] w-[520px]"
      />

      <div className="relative z-10 h-full px-[clamp(38px,4.6vw,64px)] py-[clamp(24px,4.5vh,36px)]">
        <div className="flex items-center gap-3">
          <AuthLogoMark inverse size="small" />
          <span className="text-xl font-semibold tracking-[-0.02em]">
            Eventger
          </span>
        </div>

        <div className="mt-[clamp(28px,5vh,38px)] grid grid-cols-[minmax(0,0.9fr)_minmax(250px,1.1fr)] gap-4">
          <div className="max-w-[280px]">
            <h2 className="text-pretty text-[clamp(28px,2.5vw,36px)] font-bold leading-[1.17] tracking-[-0.025em]">
              Convierte cada evento en una experiencia bien organizada.
            </h2>
            <p className="mt-3 max-w-[270px] text-[13px] leading-5 text-white/80">
              Centraliza fechas, tareas y prioridades en un solo lugar para avanzar con claridad y sin perder tiempo.
            </p>
          </div>

          <div
            className="pointer-events-none relative h-[350px] min-w-0"
            aria-hidden="true"
          >
            <div className="absolute left-4 top-0 w-[210px] rotate-[3deg] rounded-[12px] border border-white/20 bg-white/[0.1] px-3 py-3">
              <p className="flex items-center gap-1.5 text-[10px] font-medium text-white/80">
                <Star className="size-3 fill-current" strokeWidth={1.5} />
                Evento destacado
              </p>
              <p className="mt-2 text-[14px] font-semibold leading-5">
                Lanzamiento de producto
              </p>
              <p className="mt-1 text-[10px] text-white/75">
                Sáb, 12 de abr · 10:00 AM
              </p>
            </div>

            <div className="absolute left-0 top-[104px] w-[245px] -rotate-[2deg] rounded-[12px] border border-white/20 bg-white/[0.09] px-4 py-[14px]">
              <p className="text-center text-[14px] font-semibold">
                Abril 2026
              </p>
              <div className="mt-3 grid grid-cols-7 gap-x-[7px] gap-y-2">
                {weekDays.map((day, index) => (
                  <span
                    key={`${day}-${index}`}
                    className="text-center text-[9px] font-medium text-white/70"
                  >
                    {day}
                  </span>
                ))}
                {days.map((day) => (
                  <span
                    key={day}
                    className={`flex size-5 items-center justify-center rounded-[5px] text-[8px] font-medium ${
                      day === 12
                        ? 'bg-white font-bold text-[#4f46e5]'
                        : 'bg-white/[0.08] text-white/70'
                    }`}
                  >
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div className="absolute right-0 top-[142px] w-[92px] rotate-[2deg] rounded-[12px] border border-white/20 bg-[#4a43aa] px-3 py-2.5">
              <p className="text-[10px] font-medium text-white/70">Tareas</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums">3 / 5</p>
            </div>

            <div className="absolute right-0 top-[216px] w-[92px] -rotate-[2deg] rounded-[12px] border border-white/20 bg-[#4a43aa] px-3 py-2.5">
              <p className="text-[10px] font-medium text-white/70">Progreso</p>
              <p className="mt-1 text-[15px] font-semibold tabular-nums">80%</p>
            </div>
          </div>
        </div>

        <div className="auth-brand-benefits absolute bottom-[58px] left-[clamp(38px,4.6vw,64px)] flex flex-col gap-3">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-[9px] border border-white/20 bg-white/10">
                <img
                  src={benefit.icon}
                  alt=""
                  className="size-[18px]"
                />
              </span>
              <span>
                <span className="block text-[13px] font-semibold leading-4">
                  {benefit.title}
                </span>
                <span className="block text-[10px] leading-4 text-white/70">
                  {benefit.description}
                </span>
              </span>
            </div>
          ))}
        </div>

        <p className="absolute bottom-[18px] left-[clamp(38px,4.6vw,64px)] text-[9px] text-white/55">
          © 2026 Eventger. Todos los derechos reservados.
        </p>
      </div>
    </aside>
  )
}
