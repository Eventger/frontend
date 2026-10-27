import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileText, ShieldCheck } from 'lucide-react'

export type LegalTab = 'terms' | 'privacy'

type LegalTermsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: LegalTab
}

export function LegalTermsModal({
  open,
  onOpenChange,
  initialTab = 'terms',
}: LegalTermsModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab)

  useEffect(() => {
    if (open) {
      setActiveTab(initialTab)
    }
  }, [open, initialTab])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100svh-2rem)] w-[min(640px,calc(100vw-2rem))] flex-col gap-0 overflow-hidden rounded-2xl border-border-subtle bg-white p-0 shadow-xl"
        aria-describedby="legal-modal-description"
      >
        <DialogHeader className="border-b border-[#eaecf0] px-6 py-5 text-left">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-[#eef2ff] text-[#4f46e5]">
                {activeTab === 'terms' ? (
                  <FileText className="size-5" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="size-5" aria-hidden="true" />
                )}
              </span>
              <div>
                <DialogTitle className="text-lg font-bold text-[#17212b]">
                  {activeTab === 'terms' ? 'Términos y condiciones' : 'Política de privacidad'}
                </DialogTitle>
                <DialogDescription id="legal-modal-description" className="text-xs text-[#667085]">
                  Última actualización: Enero 2026 · Eventger
                </DialogDescription>
              </div>
            </div>
          </div>

          <div
            role="tablist"
            aria-label="Documentos legales"
            className="mt-4 flex rounded-lg bg-[#f2f4f7] p-1"
          >
            <button
              type="button"
              role="tab"
              id="tab-terms"
              aria-selected={activeTab === 'terms'}
              aria-controls="panel-terms"
              onClick={() => setActiveTab('terms')}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#4f46e5] ${
                activeTab === 'terms'
                  ? 'bg-white text-[#17212b] shadow-xs'
                  : 'text-[#667085] hover:text-[#17212b]'
              }`}
            >
              Términos de servicio
            </button>
            <button
              type="button"
              role="tab"
              id="tab-privacy"
              aria-selected={activeTab === 'privacy'}
              aria-controls="panel-privacy"
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-[#4f46e5] ${
                activeTab === 'privacy'
                  ? 'bg-white text-[#17212b] shadow-xs'
                  : 'text-[#667085] hover:text-[#17212b]'
              }`}
            >
              Política de privacidad
            </button>
          </div>
        </DialogHeader>

        <div
          tabIndex={0}
          role="region"
          aria-label={activeTab === 'terms' ? 'Contenido de términos y condiciones' : 'Contenido de política de privacidad'}
          className="max-h-[min(480px,50svh)] overflow-y-auto px-6 py-5 text-sm leading-6 text-[#344054] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5]/40"
        >
          {activeTab === 'terms' ? (
            <div id="panel-terms" role="tabpanel" aria-labelledby="tab-terms" className="space-y-4">
              <section>
                <h3 className="font-semibold text-[#17212b]">1. Aceptación del servicio</h3>
                <p className="mt-1 text-xs leading-5 text-[#475467]">
                  Al registrarte o iniciar sesión en Eventger, aceptas cumplir estos Términos y condiciones. Eventger es una plataforma integral para la planificación y seguimiento de eventos y tareas asociadas.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[#17212b]">2. Cuentas y seguridad</h3>
                <p className="mt-1 text-xs leading-5 text-[#475467]">
                  Eres responsable de mantener la confidencialidad de tus credenciales de acceso. Cualquier actividad realizada bajo tu cuenta se considera autorizada por ti. Debes notificarnos de inmediato cualquier uso no autorizado.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[#17212b]">3. Uso aceptable</h3>
                <p className="mt-1 text-xs leading-5 text-[#475467]">
                  Te comprometes a utilizar la plataforma conforme a las leyes vigentes y a no interferir con la infraestructura técnica ni con la privacidad de otros usuarios.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[#17212b]">4. Modificaciones y disponibilidad</h3>
                <p className="mt-1 text-xs leading-5 text-[#475467]">
                  Nos esforzamos por garantizar una alta disponibilidad de los servicios, reservándonos el derecho de realizar mantenimientos preventivos y actualizaciones funcionales notificadas oportunamente.
                </p>
              </section>
            </div>
          ) : (
            <div id="panel-privacy" role="tabpanel" aria-labelledby="tab-privacy" className="space-y-4">
              <section>
                <h3 className="font-semibold text-[#17212b]">1. Información recopilada</h3>
                <p className="mt-1 text-xs leading-5 text-[#475467]">
                  Recopilamos únicamente los datos necesarios para brindarte el servicio: nombre, dirección de correo electrónico y la información de eventos y tareas que ingresas en la aplicación.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[#17212b]">2. Uso y protección de datos</h3>
                <p className="mt-1 text-xs leading-5 text-[#475467]">
                  Tus datos se emplean con el único propósito de gestionar tus calendarios, planificaciones y notificaciones de eventos. No comercializamos tu información personal con terceros bajo ninguna circunstancia.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[#17212b]">3. Almacenamiento seguro</h3>
                <p className="mt-1 text-xs leading-5 text-[#475467]">
                  Implementamos medidas técnicas y organizativas líderes en la industria, incluyendo cifrado en tránsito (TLS/HTTPS) y en reposo, protegiendo tus datos contra accesos no autorizados.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[#17212b]">4. Tus derechos</h3>
                <p className="mt-1 text-xs leading-5 text-[#475467]">
                  Tienes derecho a acceder, rectificar o solicitar la eliminación total de tu cuenta y datos en cualquier momento desde la sección de Configuración y Seguridad.
                </p>
              </section>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end border-t border-[#eaecf0] bg-[#fafafa] px-6 py-4">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-9 rounded-lg bg-[#4f46e5] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#4338ca] focus-visible:outline-2 focus-visible:outline-[#4f46e5]"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
