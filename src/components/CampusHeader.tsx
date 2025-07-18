import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Crown, GraduationCap, MapPin, Users } from 'lucide-react'

interface CampusHeaderProps {
  currentUser: any
  onlineCount: number
}

export function CampusHeader({ currentUser, onlineCount }: CampusHeaderProps) {
  return (
    <Card className="border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="flex items-center justify-between p-4">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-berkeley-blue rounded-lg flex items-center justify-center">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-berkeley-blue">
                UC Berkeley Virtual Campus
              </h1>
              <p className="text-sm text-muted-foreground">
                Explore, connect, and collaborate
              </p>
            </div>
          </div>
        </div>

        {/* Stats and User Info */}
        <div className="flex items-center gap-4">
          {/* Online Count */}
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {onlineCount} online
            </Badge>
          </div>

          {/* Current User */}
          {currentUser && (
            <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 border">
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-berkeley-blue">
                  <AvatarImage src={currentUser.photoURL} />
                  <AvatarFallback className="bg-berkeley-blue text-white text-xs">
                    {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <GraduationCap className="absolute -top-1 -right-1 h-3 w-3 text-berkeley-blue" />
              </div>
              
              <div className="text-sm">
                <p className="font-medium">
                  {currentUser.displayName || 'Student'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}