export interface Restaurant {
  id: string
  restaurantName: string | null
  description: string | null
  phone: string | null
  email: string | null
  summary: string | null
}

export interface RestaurantCreate {
  restaurantName: string | null
  description: string | null
  phone: string | null
  email: string | null
  summary: string | null
}

export interface RestaurantUpdate extends RestaurantCreate {
  id: string
}
