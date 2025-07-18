import { useState, useEffect } from 'react'
import { OnlineUser } from '../types/campus'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Crown, GraduationCap, Users, MapPin } from 'lucide-react'

interface OnlineUsersSidebarProps {
  onlineUsers: OnlineUser[]
  currentUser: any
}

export function OnlineUsersSidebar({ onlineUsers, currentUser }: OnlineUsersSidebarProps) {
  const [students, setStudents] = useState<OnlineUser[]>([])
  const [faculty, setFaculty] = useState<OnlineUser[]>([])

  useEffect(() => {
    setStudents(onlineUsers.filter(user => user.userType === 'student'))
    setFaculty(onlineUsers.filter(user => user.userType === 'faculty'))
  }, [onlineUsers])

  const getBuildingDisplayName = (buildingId?: string) => {
    if (!buildingId) return 'Exploring campus'
    
    const buildingNames: Record<string, string> = {
      'campanile': 'Campanile',
      'sather-gate': 'Sather Gate',
      'doe-library': 'Doe Library',
      'wheeler-hall': 'Wheeler Hall',
      'evans-hall': 'Evans Hall',
      'dwinelle-hall': 'Dwinelle Hall',
      'memorial-stadium': 'Memorial Stadium',
      'student-union': 'Student Union',
      'sproul-plaza': 'Sproul Plaza',
      'berkeley-art-museum': 'Art Museum'
    }
    
    return buildingNames[buildingId] || buildingId
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-berkeley-blue">
          <Users className="h-5 w-5" />
          Online Now
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{onlineUsers.length} total</span>
          <span>•</span>
          <span>{students.length} students</span>
          <span>•</span>
          <span>{faculty.length} faculty</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)] px-4">
          {/* Faculty Section */}
          {faculty.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 px-2">
                <Crown className="h-4 w-4 text-california-gold" />
                <h3 className="font-medium text-sm text-california-gold">Faculty</h3>
                <Badge variant="secondary" className="text-xs">
                  {faculty.length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {faculty.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8 border-2 border-california-gold">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-california-gold text-white text-xs">
                          {user.displayName?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <Crown className="absolute -top-1 -right-1 h-3 w-3 text-california-gold" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.displayName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {getBuildingDisplayName(user.currentBuilding)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {faculty.length > 0 && students.length > 0 && (
            <Separator className="my-4" />
          )}

          {/* Students Section */}
          {students.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3 px-2">
                <GraduationCap className="h-4 w-4 text-berkeley-blue" />
                <h3 className="font-medium text-sm text-berkeley-blue">Students</h3>
                <Badge variant="secondary" className="text-xs">
                  {students.length}
                </Badge>
              </div>
              
              <div className="space-y-2">
                {students.map((user) => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      user.id === currentUser?.id
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-berkeley-blue ring-2 ring-berkeley-blue ring-opacity-20'
                        : 'bg-gradient-to-r from-slate-50 to-gray-50 border border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-8 w-8 border-2 border-berkeley-blue">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="bg-berkeley-blue text-white text-xs">
                          {user.displayName?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <GraduationCap className="absolute -top-1 -right-1 h-3 w-3 text-berkeley-blue" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {user.displayName}
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-berkeley-blue ml-1">(You)</span>
                        )}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {getBuildingDisplayName(user.currentBuilding)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {onlineUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No one is online right now</p>
              <p className="text-xs mt-1">Be the first to explore the campus!</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}