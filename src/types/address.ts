export interface Address {
  id: string
  street: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  summary: string | null
  userId: string | null
  restaurantId: string | null
}

export interface AddressCreate {
  street: string | null
  city: string | null
  postalCode: string | null
  country: string | null
  summary: string | null
  userId: string | null
  restaurantId: string | null
}

export interface AddressUpdate extends AddressCreate {
  id: string
}
