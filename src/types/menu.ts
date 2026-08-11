export interface Menu {
  id: string
  restaurantId: string
  name: string
  isActive: boolean
  summary: string
}

export interface MenuCreate {
  restaurantId: string
  name: string
  isActive: boolean
  summary: string
}

export interface MenuUpdate {
  id: string
  restaurantId: string
  name: string
  isActive: boolean
  summary: string
}

export interface MenuCategory {
  id: string
  menuId: string
  name: string
  summary: string
}

export interface MenuCategoryCreate {
  menuId: string
  name: string
  summary: string
}

export interface MenuCategoryUpdate {
  id: string
  menuId: string
  name: string
  summary: string
}

export interface MenuItem {
  id: string
  menuCategoryId: string
  name: string
  description: string
  price: number
  isAvailable: boolean
  imageUrl: string
  summary: string
}

export interface MenuItemCreate {
  menuCategoryId: string
  name: string
  description: string
  price: number
  isAvailable: boolean
  imageUrl: string
  summary: string
}

export interface MenuItemUpdate {
  id: string
  menuCategoryId: string
  name: string
  description: string
  price: number
  isAvailable: boolean
  imageUrl: string
  summary: string
}
