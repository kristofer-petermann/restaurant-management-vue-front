export interface RestaurantUser {
  id: string
  restaurantId: string
  userId: string
  userRole: number
  role: string | null
  summary: string | null
}

export interface RestaurantUserCreate {
  restaurantId: string
  userId: string
  userRole: number
  role: string | null
  summary: string | null
}

export interface RestaurantUserUpdate extends RestaurantUserCreate {
  id: string
}
