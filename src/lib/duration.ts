/** Presenta horas decimales como una duración, redondeada al minuto más cercano. */
export function formatHoursDuration(value: string | number): string {
  const totalMinutes = Math.round(Number(value) * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`
}
