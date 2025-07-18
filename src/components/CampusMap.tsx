import { useState, useEffect, useRef, useCallback } from 'react'
import { blink } from '../blink/client'
import { Building, OnlineUser } from '../types/campus'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { MeetingRoomModal } from './MeetingRoomModal'
import { ScrollArea } from './ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Users, MapPin, Crown, GraduationCap, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { cn } from '../lib/utils'

interface CampusMapProps {
  currentUser: any
}

export function CampusMap({ currentUser }: CampusMapProps) {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [buildingUsers, setBuildingUsers] = useState<OnlineUser[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadBuildings()
    loadOnlineUsers()
    
    // Set up real-time updates
    const interval = setInterval(() => {
      loadOnlineUsers()
    }, 5000)

    return () => clearInterval(interval)
  }, [loadOnlineUsers])

  const loadBuildings = async () => {
    try {
      const result = await blink.db.buildings.list({
        orderBy: { name: 'asc' }
      })
      // Map snake_case to camelCase for frontend
      const mappedBuildings = result.map((building: any) => ({
        id: building.id,
        name: building.name,
        description: building.description,
        xPosition: building.x_position,
        yPosition: building.y_position,
        capacity: building.capacity,
        isActive: Number(building.is_active) > 0,
        buildingType: building.building_type,
        createdAt: building.created_at
      }))
      setBuildings(mappedBuildings)
    } catch (error) {
      console.error('Failed to load buildings:', error)
      // Set fallback buildings if database fails
      setBuildings([
        {
          id: 'campanile',
          name: 'Campanile',
          description: 'The iconic UC Berkeley bell tower',
          xPosition: 400,
          yPosition: 300,
          capacity: 50,
          isActive: true,
          buildingType: 'landmark',
          createdAt: new Date().toISOString()
        },
        {
          id: 'doe-library',
          name: 'Doe Library',
          description: 'Main library on campus',
          xPosition: 350,
          yPosition: 250,
          capacity: 200,
          isActive: true,
          buildingType: 'academic',
          createdAt: new Date().toISOString()
        }
      ])
    }
  }

  const loadOnlineUsers = useCallback(async () => {
    try {
      // Add some demo users for better experience
      const demoUsers: OnlineUser[] = [
        {
          id: currentUser?.id || 'current-user',
          displayName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'You',
          userType: 'student',
          currentBuilding: 'campanile',
          xPosition: 400,
          yPosition: 300
        },
        {
          id: 'demo1',
          displayName: 'Alice Chen',
          userType: 'student',
          currentBuilding: 'doe-library',
          xPosition: 350,
          yPosition: 250
        },
        {
          id: 'demo2',
          displayName: 'Prof. Johnson',
          userType: 'faculty',
          currentBuilding: 'wheeler-hall',
          xPosition: 300,
          yPosition: 200
        },
        {
          id: 'demo3',
          displayName: 'Bob Martinez',
          userType: 'student',
          currentBuilding: 'student-union',
          xPosition: 320,
          yPosition: 350
        },
        {
          id: 'demo4',
          displayName: 'Dr. Smith',
          userType: 'faculty',
          currentBuilding: 'evans-hall',
          xPosition: 450,
          yPosition: 180
        }
      ]

      setOnlineUsers(demoUsers)
    } catch (error) {
      console.error('Failed to load online users:', error)
      // Fallback to minimal demo users
      const fallbackUsers: OnlineUser[] = [
        {
          id: 'demo1',
          displayName: 'Alice Chen',
          userType: 'student',
          currentBuilding: 'doe-library',
          xPosition: 350,
          yPosition: 250
        },
        {
          id: 'demo2',
          displayName: 'Prof. Johnson',
          userType: 'faculty',
          currentBuilding: 'campanile',
          xPosition: 400,
          yPosition: 300
        }
      ]
      setOnlineUsers(fallbackUsers)
    }
  }, [currentUser])

  const handleBuildingClick = async (building: Building) => {
    setSelectedBuilding(building)
    
    // Get users in this building
    const usersInBuilding = onlineUsers.filter(user => user.currentBuilding === building.id)
    setBuildingUsers(usersInBuilding)
    setIsDialogOpen(true)
  }

  const joinBuilding = async (building: Building) => {
    try {
      // For now, just update the UI optimistically
      const updatedUsers = onlineUsers.map(user => 
        user.id === (currentUser?.id || 'current-user') 
          ? { ...user, currentBuilding: building.id, xPosition: building.xPosition, yPosition: building.yPosition }
          : user
      )
      setOnlineUsers(updatedUsers)
      setIsDialogOpen(false)
    } catch (error) {
      console.error('Failed to join building:', error)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handleResetView = () => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }

  const getBuildingColor = (buildingType: string) => {
    switch (buildingType) {
      case 'landmark': return 'bg-california-gold'
      case 'academic': return 'bg-berkeley-blue'
      case 'athletics': return 'bg-red-500'
      case 'student-life': return 'bg-green-500'
      case 'cultural': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getUsersInBuilding = (buildingId: string) => {
    return onlineUsers.filter(user => user.currentBuilding === buildingId)
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomIn}
          className="bg-white/90 backdrop-blur-sm"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleZoomOut}
          className="bg-white/90 backdrop-blur-sm"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={handleResetView}
          className="bg-white/90 backdrop-blur-sm"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div
          className="relative w-[800px] h-[600px] mx-auto mt-20"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: 'center center'
          }}
        >
          {/* Campus Background */}
          <div className="absolute inset-0 bg-green-100 rounded-lg border-2 border-green-200">
            {/* Campus paths */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 100 300 Q 400 250 700 350"
                stroke="#8B7355"
                strokeWidth="8"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 200 100 L 200 500"
                stroke="#8B7355"
                strokeWidth="6"
                fill="none"
                opacity="0.6"
              />
              <path
                d="M 100 450 L 600 450"
                stroke="#8B7355"
                strokeWidth="6"
                fill="none"
                opacity="0.6"
              />
            </svg>
          </div>

          {/* Buildings */}
          {buildings.map((building) => {
            const usersInBuilding = getUsersInBuilding(building.id)
            const hasUsers = usersInBuilding.length > 0
            
            return (
              <div
                key={building.id}
                className={cn(
                  "absolute building-marker rounded-lg shadow-lg border-2 border-white",
                  "flex items-center justify-center text-white font-medium text-sm",
                  "hover:shadow-xl transition-all duration-300",
                  getBuildingColor(building.buildingType),
                  hasUsers && "ring-4 ring-yellow-400 ring-opacity-50 animate-pulse-gentle"
                )}
                style={{
                  left: building.xPosition - 30,
                  top: building.yPosition - 20,
                  width: 60,
                  height: 40,
                  zIndex: hasUsers ? 20 : 10
                }}
                onClick={() => handleBuildingClick(building)}
                title={building.name}
              >
                <div className="text-center">
                  <div className="text-xs font-bold truncate px-1">
                    {building.name.split(' ')[0]}
                  </div>
                  {hasUsers && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">{usersInBuilding.length}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* User Avatars */}
          {onlineUsers.map((user) => (
            <div
              key={user.id}
              className="absolute user-avatar z-30"
              style={{
                left: (user.xPosition || 0) - 12,
                top: (user.yPosition || 0) - 35
              }}
              title={`${user.displayName} (${user.userType})`}
            >
              <div className="relative">
                <Avatar className="h-6 w-6 border-2 border-white shadow-lg">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-xs bg-berkeley-blue text-white">
                    {user.displayName?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                {user.userType === 'faculty' && (
                  <Crown className="absolute -top-1 -right-1 h-3 w-3 text-california-gold" />
                )}
                {user.userType === 'student' && (
                  <GraduationCap className="absolute -top-1 -right-1 h-3 w-3 text-berkeley-blue" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Building Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-berkeley-blue" />
              {selectedBuilding?.name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBuilding && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {selectedBuilding.description}
              </p>
              
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {buildingUsers.length}/{selectedBuilding.capacity}
                </Badge>
                <Badge variant="secondary">
                  {selectedBuilding.buildingType}
                </Badge>
              </div>

              {buildingUsers.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">People here:</h4>
                  <ScrollArea className="h-32">
                    <div className="space-y-2">
                      {buildingUsers.map((user) => (
                        <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg bg-muted">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback className="text-xs">
                              {user.displayName?.charAt(0) || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{user.displayName}</span>
                          {user.userType === 'faculty' && (
                            <Crown className="h-3 w-3 text-california-gold" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}

              <Button 
                onClick={() => joinBuilding(selectedBuilding)} 
                className="w-full bg-berkeley-blue hover:bg-berkeley-blue/90"
              >
                Join Meeting Room
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}