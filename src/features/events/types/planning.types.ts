export type DayPlan = {
  date: string
  event_date: string
  existing_hours: string
  added_hours: string
  planned_hours: string
  daily_limit_hours: string
  overload_hours: string
  has_conflict: boolean
  tasks: { id: number; name: string; event_name: string; estimated_hours: string }[]
  suggestion: { date: string; planned_hours: string } | null
}
