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

type AuthBrandPanelProps = {
  lowered?: boolean
}

export function AuthBrandPanel({
  lowered = false,
}: AuthBrandPanelProps) {
  return (
    <aside className="auth-brand-panel relative hidden min-h-svh overflow-hidden bg-[#3730a3] text-white min-[1360px]:block min-[1360px]:w-[57%] min-[1360px]:max-w-[820px] min-[1360px]:shrink-0 min-[1360px]:self-stretch">
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

      <div
        className={`relative z-10 mx-auto h-full w-full max-w-[820px] px-[clamp(64px,5.8vw,84px)] pt-[clamp(36px,5vh,52px)] ${
          lowered ? 'translate-y-3' : ''
        }`}
      >
        <div className="flex items-center gap-3">
          <AuthLogoMark inverse />
          <span className="text-[27px] font-semibold tracking-[-0.025em]">
            Eventger
          </span>
        </div>

        <div className="mt-[clamp(58px,7.5vh,77px)] grid grid-cols-[minmax(280px,316px)_minmax(270px,285px)] gap-[clamp(24px,3.55vw,51px)]">
          <div className="max-w-[316px]">
            <h2 className="text-pretty text-[clamp(36px,2.8vw,40px)] font-bold leading-[1.18] tracking-[-0.025em]">
              Convierte cada evento en una experiencia bien organizada.
            </h2>
            <p className="mt-[35px] max-w-[310px] text-[16px] leading-6 text-white/80">
              Centraliza fechas, tareas y prioridades en un solo lugar para avanzar con claridad y sin perder tiempo.
            </p>
          </div>

          <div
            className="auth-brand-artwork pointer-events-none relative h-[494px] min-w-0"
            aria-hidden="true"
          >
            <div className="absolute left-5 top-0 w-[254px] rounded-[13px] border border-white/20 bg-white/[0.1] px-4 py-3">
              <p className="flex items-center gap-2 text-[12px] font-medium text-white/80">
                <Star className="size-3.5 fill-current" strokeWidth={1.5} />
                Evento destacado
              </p>
              <p className="mt-3 text-[18px] font-semibold leading-[1.25]">
                Lanzamiento de producto
              </p>
              <p className="mt-2 text-[12px] text-white/75">
                Sáb, 12 de abr · 10:00 AM
              </p>
            </div>

            <div className="absolute left-0 top-[131px] w-[285px] rounded-[13px] border border-white/20 bg-white/[0.09] px-6 py-[23px]">
              <p className="text-center text-[17px] font-semibold">
                Abril 2026
              </p>
              <div className="mt-4 grid grid-cols-7 gap-x-[9px] gap-y-[10px]">
                {weekDays.map((day, index) => (
                  <span
                    key={`${day}-${index}`}
                    className="text-center text-[11px] font-medium text-white/70"
                  >
                    {day}
                  </span>
                ))}
                {days.map((day) => (
                  <span
                    key={day}
                    className={`flex size-6 items-center justify-center rounded-[6px] text-[10px] font-medium ${
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

            <div className="absolute left-0 top-[423px] w-[130px] rounded-[13px] border border-white/20 bg-[#4a43aa] px-4 py-2.5">
              <p className="text-[13px] font-medium text-white/70">Tareas</p>
              <p className="mt-1 text-[19px] font-semibold tabular-nums">3 / 5</p>
            </div>

            <div className="absolute right-0 top-[423px] w-[130px] rounded-[13px] border border-white/20 bg-[#4a43aa] px-4 py-2.5">
              <p className="text-[13px] font-medium text-white/70">Progreso</p>
              <p className="mt-1 text-[19px] font-semibold tabular-nums">80%</p>
            </div>
          </div>
        </div>

        <div className="auth-brand-benefits absolute bottom-[147px] left-[clamp(64px,5.8vw,84px)] flex flex-col gap-8">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex items-center gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-[11px] border border-white/20 bg-white/10">
                <img
                  src={benefit.icon}
                  alt=""
                  className="size-[22px]"
                />
              </span>
              <span>
                <span className="block text-[16px] font-semibold leading-5">
                  {benefit.title}
                </span>
                <span className="block text-[13px] leading-5 text-white/70">
                  {benefit.description}
                </span>
              </span>
            </div>
          ))}
        </div>

        <p className="absolute bottom-[62px] left-[clamp(64px,5.8vw,84px)] text-[11px] text-white/55">
          © 2026 Eventger. Todos los derechos reservados.
        </p>
      </div>
    </aside>
  )
}
