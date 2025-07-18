export interface User {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
  userType: 'student' | 'faculty'
  currentLocation?: string
  currentBuilding?: string
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

export interface UserLocation {
  id: string
  userId: string
  buildingId?: string
  xPosition?: number
  yPosition?: number
  timestamp: string
}

export interface OnlineUser {
  id: string
  displayName: string
  userType: 'student' | 'faculty'
  avatarUrl?: string
  currentBuilding?: string
  xPosition?: number
  yPosition?: number
}

export interface MeetingRoom {
  buildingId: string
  buildingName: string
  users: OnlineUser[]
  capacity: number
}