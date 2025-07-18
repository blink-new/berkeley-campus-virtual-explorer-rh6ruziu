import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { ScrollArea } from './ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Calendar, Clock, MapPin, Users, Star, Coffee, BookOpen, Gamepad2, Music } from 'lucide-react'

interface CampusEvent {
  id: string
  title: string
  description: string
  buildingId: string
  buildingName: string
  startTime: Date
  endTime: Date
  attendees: number
  maxAttendees: number
  eventType: 'study-group' | 'social' | 'workshop' | 'gaming' | 'music' | 'other'
  organizer: string
  isJoined: boolean
}

interface CampusEventsProps {
  onNavigateToBuilding: (buildingId: string) => void
  currentUser: any
}

const EVENT_TYPES = {
  'study-group': { icon: BookOpen, color: 'bg-blue-500', label: 'Study Group' },
  'social': { icon: Coffee, color: 'bg-green-500', label: 'Social' },
  'workshop': { icon: Star, color: 'bg-purple-500', label: 'Workshop' },
  'gaming': { icon: Gamepad2, color: 'bg-red-500', label: 'Gaming' },
  'music': { icon: Music, color: 'bg-orange-500', label: 'Music' },
  'other': { icon: Users, color: 'bg-gray-500', label: 'Other' }
}

// Demo events data
const DEMO_EVENTS: CampusEvent[] = [
  {
    id: 'event-1',
    title: 'CS 61A Study Group',
    description: 'Working through recursion problems and preparing for the upcoming midterm. All skill levels welcome!',
    buildingId: 'doe-library',
    buildingName: 'Doe Library',
    startTime: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from now
    endTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    attendees: 8,
    maxAttendees: 15,
    eventType: 'study-group',
    organizer: 'Alice Chen',
    isJoined: false
  },
  {
    id: 'event-2',
    title: 'Coffee & Chat',
    description: 'Casual meetup for international students. Come practice English and make new friends!',
    buildingId: 'student-union',
    buildingName: 'Student Union',
    startTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
    endTime: new Date(Date.now() + 90 * 60 * 1000), // 1.5 hours from now
    attendees: 12,
    maxAttendees: 20,
    eventType: 'social',
    organizer: 'International Student Office',
    isJoined: true
  },
  {
    id: 'event-3',
    title: 'React Workshop',
    description: 'Learn modern React patterns and hooks. Bring your laptop and follow along with hands-on coding.',
    buildingId: 'evans-hall',
    buildingName: 'Evans Hall',
    startTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    endTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours from now
    attendees: 25,
    maxAttendees: 30,
    eventType: 'workshop',
    organizer: 'Web Development Club',
    isJoined: false
  },
  {
    id: 'event-4',
    title: 'Among Us Night',
    description: 'Virtual game night! Join us for some fun rounds of Among Us and other party games.',
    buildingId: 'campanile',
    buildingName: 'Campanile',
    startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    attendees: 15,
    maxAttendees: 25,
    eventType: 'gaming',
    organizer: 'Gaming Society',
    isJoined: false
  },
  {
    id: 'event-5',
    title: 'Acoustic Jam Session',
    description: 'Bring your instruments or just come to listen! Open mic style acoustic session.',
    buildingId: 'sproul-plaza',
    buildingName: 'Sproul Plaza',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
    attendees: 7,
    maxAttendees: 12,
    eventType: 'music',
    organizer: 'Music Collective',
    isJoined: false
  }
]

export function CampusEvents({ onNavigateToBuilding, currentUser }: CampusEventsProps) {
  const [events, setEvents] = useState<CampusEvent[]>(DEMO_EVENTS)
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'joined' | 'upcoming'>('upcoming')

  const filteredEvents = events.filter(event => {
    const now = new Date()
    const isUpcoming = event.startTime > now
    
    switch (filter) {
      case 'joined':
        return event.isJoined
      case 'upcoming':
        return isUpcoming
      default:
        return true
    }
  }).sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  const handleJoinEvent = (eventId: string) => {
    setEvents(prev => prev.map(event => 
      event.id === eventId 
        ? { ...event, isJoined: !event.isJoined, attendees: event.isJoined ? event.attendees - 1 : event.attendees + 1 }
        : event
    ))
  }

  const handleEventClick = (event: CampusEvent) => {
    setSelectedEvent(event)
    setIsDialogOpen(true)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const getTimeUntilEvent = (startTime: Date) => {
    const now = new Date()
    const diff = startTime.getTime() - now.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    
    if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      return `${hours}h ${minutes % 60}m`
    }
  }

  return (
    <>
      <Card className="absolute bottom-4 right-4 z-20 w-80 max-h-96">
        <CardHeader className="pb-3">
          <CardTitle className="text-berkeley-blue flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Campus Events
          </CardTitle>
          <div className="flex gap-1">
            <Button
              variant={filter === 'upcoming' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('upcoming')}
              className="text-xs"
            >
              Upcoming
            </Button>
            <Button
              variant={filter === 'joined' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('joined')}
              className="text-xs"
            >
              Joined
            </Button>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs"
            >
              All
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea className="h-64 px-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events found</p>
              </div>
            ) : (
              <div className="space-y-3 pb-4">
                {filteredEvents.map((event) => {
                  const EventIcon = EVENT_TYPES[event.eventType].icon
                  const isStartingSoon = new Date(event.startTime).getTime() - Date.now() < 30 * 60 * 1000 // 30 minutes
                  
                  return (
                    <div
                      key={event.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        event.isJoined 
                          ? 'bg-berkeley-blue/5 border-berkeley-blue/20' 
                          : 'bg-white border-gray-200'
                      } ${isStartingSoon ? 'ring-2 ring-california-gold ring-opacity-50' : ''}`}
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`p-1 rounded ${EVENT_TYPES[event.eventType].color} text-white`}>
                          <EventIcon className="h-3 w-3" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{event.title}</h4>
                            {event.isJoined && (
                              <Badge variant="secondary" className="text-xs">Joined</Badge>
                            )}
                            {isStartingSoon && (
                              <Badge variant="outline" className="text-xs text-california-gold border-california-gold">
                                Soon
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>{formatDate(event.startTime)} at {formatTime(event.startTime)}</span>
                              <span>•</span>
                              <span>in {getTimeUntilEvent(event.startTime)}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{event.buildingName}</span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{event.attendees}/{event.maxAttendees} attending</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-berkeley-blue" />
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {React.createElement(EVENT_TYPES[selectedEvent.eventType].icon, { className: "h-3 w-3" })}
                  {EVENT_TYPES[selectedEvent.eventType].label}
                </Badge>
                {selectedEvent.isJoined && (
                  <Badge className="bg-berkeley-blue">Joined</Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground leading-relaxed">
                {selectedEvent.description}
              </p>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {formatDate(selectedEvent.startTime)} at {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.buildingName}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedEvent.attendees}/{selectedEvent.maxAttendees} attending</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span>Organized by {selectedEvent.organizer}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleJoinEvent(selectedEvent.id)}
                  className={`flex-1 ${
                    selectedEvent.isJoined 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-berkeley-blue hover:bg-berkeley-blue/90'
                  }`}
                  disabled={!selectedEvent.isJoined && selectedEvent.attendees >= selectedEvent.maxAttendees}
                >
                  {selectedEvent.isJoined ? 'Leave Event' : 'Join Event'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    onNavigateToBuilding(selectedEvent.buildingId)
                    setIsDialogOpen(false)
                  }}
                >
                  <MapPin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}