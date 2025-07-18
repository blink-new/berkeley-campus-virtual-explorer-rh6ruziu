import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Send, Users, Crown, LogOut, MapPin } from 'lucide-react'
import { blink } from '../blink/client'
import { MeetingRoom, Building, OnlineUser } from '../types'

interface MeetingRoomModalProps {
  isOpen: boolean
  onClose: () => void
  room: MeetingRoom | null
  building: Building | null
  currentUser: any
}

interface ChatMessage {
  id: string
  userId: string
  userName: string
  userType: 'student' | 'faculty'
  message: string
  timestamp: number
}

export function MeetingRoomModal({ isOpen, onClose, room, building, currentUser }: MeetingRoomModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [roomUsers, setRoomUsers] = useState<OnlineUser[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && room && currentUser) {
      initializeRoom()
    }
    
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
      }
    }
  }, [isOpen, room, currentUser, initializeRoom])

  const initializeRoom = useCallback(async () => {
    if (!room || !currentUser) return

    setIsLoading(true)
    
    try {
      // Set up realtime channel for this room
      const channel = blink.realtime.channel(`room-${room.id}`)
      channelRef.current = channel

      await channel.subscribe({
        userId: currentUser.id,
        metadata: {
          displayName: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0],
          userType: 'student', // Default to student, could be determined from user data
          roomId: room.id,
          buildingId: room.buildingId
        }
      })

      // Listen for new messages
      channel.onMessage((message: any) => {
        if (message.type === 'chat') {
          setMessages(prev => [...prev, {
            id: message.id,
            userId: message.userId,
            userName: message.metadata?.displayName || 'Anonymous',
            userType: message.metadata?.userType || 'student',
            message: message.data.text,
            timestamp: message.timestamp
          }])
        }
      })

      // Listen for presence changes
      channel.onPresence((users: any[]) => {
        const roomUsers = users.map(user => ({
          id: user.userId,
          email: user.userId, // Placeholder
          displayName: user.metadata?.displayName,
          userType: user.metadata?.userType || 'student',
          isOnline: true,
          lastSeen: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })) as OnlineUser[]
        
        setRoomUsers(roomUsers)
      })

      // Load recent messages
      const recentMessages = await channel.getMessages({ limit: 50 })
      const chatMessages = recentMessages
        .filter((msg: any) => msg.type === 'chat')
        .map((msg: any) => ({
          id: msg.id,
          userId: msg.userId,
          userName: msg.metadata?.displayName || 'Anonymous',
          userType: msg.metadata?.userType || 'student',
          message: msg.data.text,
          timestamp: msg.timestamp
        }))
      
      setMessages(chatMessages)

      // Update user location in database
      await updateUserLocation()
      
    } catch (error) {
      console.error('Error initializing room:', error)
    } finally {
      setIsLoading(false)
    }
  }, [room, currentUser, updateUserLocation])

  const updateUserLocation = useCallback(async () => {
    if (!currentUser || !room || !building) return

    try {
      // Update user's current location
      await blink.db.userLocations.create({
        id: `${currentUser.id}-${room.id}-${Date.now()}`,
        userId: currentUser.id,
        buildingId: building.id,
        roomId: room.id,
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // Update room occupancy
      await blink.db.meetingRooms.update(room.id, {
        currentOccupancy: Math.max(0, (room.currentOccupancy || 0) + 1)
      })
    } catch (error) {
      console.error('Error updating location:', error)
    }
  }, [currentUser, room, building])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !channelRef.current || !currentUser) return

    try {
      await channelRef.current.publish('chat', {
        text: newMessage,
        timestamp: Date.now()
      }, {
        userId: currentUser.id,
        metadata: {
          displayName: currentUser.user_metadata?.display_name || currentUser.email?.split('@')[0],
          userType: 'student' // Could be determined from user data
        }
      })

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleLeaveRoom = async () => {
    if (channelRef.current) {
      await channelRef.current.unsubscribe()
      channelRef.current = null
    }

    // Update room occupancy
    if (room) {
      try {
        await blink.db.meetingRooms.update(room.id, {
          currentOccupancy: Math.max(0, (room.currentOccupancy || 0) - 1)
        })
      } catch (error) {
        console.error('Error updating room occupancy:', error)
      }
    }

    onClose()
  }

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (!room || !building) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleLeaveRoom}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-berkeley-blue" />
              <div>
                <span>{room.name}</span>
                <p className="text-sm font-normal text-gray-600">{building.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {roomUsers.length}/{room.capacity}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeaveRoom}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Leave
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex gap-4 min-h-0">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-berkeley-blue border-t-transparent rounded-full mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading room...</p>
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={`
                          text-xs
                          ${message.userType === 'faculty' 
                            ? 'bg-california-gold text-white' 
                            : 'bg-berkeley-blue text-white'
                          }
                        `}>
                          {message.userType === 'faculty' ? (
                            <Crown className="w-4 h-4" />
                          ) : (
                            message.userName[0]?.toUpperCase()
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{message.userName}</span>
                          {message.userType === 'faculty' && (
                            <Badge className="bg-california-gold text-white text-xs px-1.5 py-0.5">
                              Faculty
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 bg-white p-2 rounded-lg shadow-sm">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No messages yet</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Start the conversation!
                    </p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-berkeley-blue hover:bg-berkeley-blue/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Users Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Card className="h-full">
              <div className="p-4 border-b">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  In this room ({roomUsers.length})
                </h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-2">
                  {roomUsers.map((user) => (
                    <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className={`
                          text-xs
                          ${user.userType === 'faculty' 
                            ? 'bg-california-gold text-white' 
                            : 'bg-berkeley-blue text-white'
                          }
                        `}>
                          {user.userType === 'faculty' ? (
                            <Crown className="w-4 h-4" />
                          ) : (
                            <Users className="w-4 h-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.displayName || user.email.split('@')[0]}
                          {user.id === currentUser?.id && ' (You)'}
                        </p>
                        {user.userType === 'faculty' && (
                          <Badge className="bg-california-gold text-white text-xs px-1 py-0">
                            Faculty
                          </Badge>
                        )}
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-gentle" />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}