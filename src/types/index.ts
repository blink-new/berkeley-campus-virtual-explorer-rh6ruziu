export interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  userType: 'student' | 'faculty'
  currentLocation?: string
  currentBuilding?: string
  currentRoom?: string
  isOnline: boolean
  lastSeen: string
  createdAt: string
  updatedAt: string
}

export interface Building {
  id: string
  name: string
  description?: string
  xPosition: number
  yPosition: number
  capacity: number
  isActive: boolean
  buildingType: string
  createdAt: string
}

export interface MeetingRoom {
  id: string
  buildingId: string
  name: string
  description?: string
  capacity: number
  isActive: boolean
  currentOccupancy: number
  createdAt: string
}

export interface UserLocation {
  id: string
  userId: string
  buildingId?: string
  roomId?: string
  xPosition?: number
  yPosition?: number
  joinedAt: string
  updatedAt: string
}

export interface OnlineUser extends User {
  location?: UserLocation
  building?: Building
  room?: MeetingRoom
}