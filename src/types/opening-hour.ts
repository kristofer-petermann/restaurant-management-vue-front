export interface OpeningHour {
  id: string
  restaurantId: string
  dayOfWeek: string | null
  openTime: string
  closeTime: string
  summary: string | null
}

export interface OpeningHourCreate {
  restaurantId: string
  dayOfWeek: string | null
  openTime: string
  closeTime: string
  summary: string | null
}

export interface OpeningHourUpdate extends OpeningHourCreate {
  id: string
}
