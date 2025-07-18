import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Circle, MessageCircle, Coffee, BookOpen, Users, Settings } from 'lucide-react'

export type UserStatus = 'available' | 'busy' | 'in-meeting' | 'studying' | 'break' | 'away'

interface UserStatusInfo {
  status: UserStatus
  label: string
  color: string
  icon: React.ReactNode
  description: string
}

const STATUS_OPTIONS: UserStatusInfo[] = [
  {
    status: 'available',
    label: 'Available',
    color: 'bg-green-500',
    icon: <Circle className="h-3 w-3" />,
    description: 'Ready to chat and collaborate'
  },
  {
    status: 'busy',
    label: 'Busy',
    color: 'bg-red-500',
    icon: <Circle className="h-3 w-3" />,
    description: 'Working on something important'
  },
  {
    status: 'in-meeting',
    label: 'In Meeting',
    color: 'bg-purple-500',
    icon: <Users className="h-3 w-3" />,
    description: 'Currently in a virtual meeting'
  },
  {
    status: 'studying',
    label: 'Studying',
    color: 'bg-blue-500',
    icon: <BookOpen className="h-3 w-3" />,
    description: 'Focused study time'
  },
  {
    status: 'break',
    label: 'On Break',
    color: 'bg-orange-500',
    icon: <Coffee className="h-3 w-3" />,
    description: 'Taking a break, feel free to chat'
  },
  {
    status: 'away',
    label: 'Away',
    color: 'bg-gray-500',
    icon: <Circle className="h-3 w-3" />,
    description: 'Away from computer'
  }
]

interface UserStatusSystemProps {
  currentStatus: UserStatus
  customMessage?: string
  onStatusChange: (status: UserStatus, message?: string) => void
  className?: string
}

export function UserStatusSystem({ 
  currentStatus, 
  customMessage, 
  onStatusChange, 
  className = '' 
}: UserStatusSystemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(currentStatus)
  const [statusMessage, setStatusMessage] = useState(customMessage || '')

  const currentStatusInfo = STATUS_OPTIONS.find(s => s.status === currentStatus)

  const handleSave = () => {
    onStatusChange(selectedStatus, statusMessage.trim() || undefined)
    setIsOpen(false)
  }

  const handleCancel = () => {
    setSelectedStatus(currentStatus)
    setStatusMessage(customMessage || '')
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`flex items-center gap-2 h-auto p-2 ${className}`}
        >
          <div className={`w-3 h-3 rounded-full ${currentStatusInfo?.color || 'bg-gray-500'}`} />
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{currentStatusInfo?.label || 'Unknown'}</span>
            {customMessage && (
              <span className="text-xs text-muted-foreground truncate max-w-32">
                {customMessage}
              </span>
            )}
          </div>
          <Settings className="h-3 w-3 opacity-50" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-berkeley-blue" />
            Update Your Status
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={selectedStatus} onValueChange={(value: UserStatus) => setSelectedStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.status} value={option.status}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${option.color}`} />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedStatus && (
              <p className="text-xs text-muted-foreground mt-1">
                {STATUS_OPTIONS.find(s => s.status === selectedStatus)?.description}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Custom Message 
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Textarea
              placeholder="What are you working on?"
              value={statusMessage}
              onChange={(e) => setStatusMessage(e.target.value)}
              className="resize-none"
              rows={2}
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {statusMessage.length}/100 characters
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1 bg-berkeley-blue hover:bg-berkeley-blue/90">
              Update Status
            </Button>
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Status indicator component for showing other users' statuses
interface StatusIndicatorProps {
  status: UserStatus
  message?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export function StatusIndicator({ 
  status, 
  message, 
  size = 'md', 
  showLabel = false 
}: StatusIndicatorProps) {
  const statusInfo = STATUS_OPTIONS.find(s => s.status === status)
  
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  }

  if (!statusInfo) return null

  return (
    <div className="flex items-center gap-1" title={`${statusInfo.label}${message ? `: ${message}` : ''}`}>
      <div className={`rounded-full ${statusInfo.color} ${sizeClasses[size]}`} />
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-xs font-medium">{statusInfo.label}</span>
          {message && (
            <span className="text-xs text-muted-foreground truncate max-w-24">
              {message}
            </span>
          )}
        </div>
      )}
    </div>
  )
}