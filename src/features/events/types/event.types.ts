export interface EventType {
  id: number
  name: string
  description: string
}

export interface EventTypesApiResponse {
  success: boolean
  data: EventType[]
}

export interface CreateEventInput {
  name: string
  typeId: number | null
  eventDate: string
  location: string
  contact: string
}

export interface CreateEventApiRequest {
  name: string
  type: number
  date: string
  location: string
  contact: string
}

export interface EventApiData {
  id: number
  user: number
  name: string
  type: number
  date: string
  location: string
  contact: string
  created_at: string
  updated_at: string
}

export interface EventsApiResponse {
  success: boolean
  data: EventApiData[]
}

export interface EventApiResponse {
  success: boolean
  data: EventApiData
}

export interface CreateEventApiResponse {
  success: boolean
  message: string
  data: EventApiData
}

export interface Event {
  id: number
  name: string
  typeId: number
  eventDate: string
  location: string
  contact: string
}

export type UpdateEventInput =
  CreateEventInput

export type UpdateEventApiRequest =
  CreateEventApiRequest

export interface UpdateEventApiResponse {
  success: boolean
  message: string
  data: EventApiData
}