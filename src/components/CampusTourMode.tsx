import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Play, Pause, SkipForward, RotateCcw, MapPin, Clock, Users } from 'lucide-react'

interface TourStop {
  id: string
  buildingId: string
  buildingName: string
  title: string
  description: string
  funFact: string
  duration: number // in seconds
  xPosition: number
  yPosition: number
}

interface CampusTourModeProps {
  onNavigateToBuilding: (buildingId: string, x: number, y: number) => void
  isActive: boolean
  onToggle: () => void
}

const TOUR_STOPS: TourStop[] = [
  {
    id: 'stop-1',
    buildingId: 'campanile',
    buildingName: 'Campanile',
    title: 'Welcome to UC Berkeley!',
    description: 'Start your journey at the iconic Campanile, Berkeley\'s most recognizable landmark. This 307-foot tower offers stunning views of the Bay Area.',
    funFact: 'The Campanile plays concerts every weekday at noon and 6pm!',
    duration: 30,
    xPosition: 400,
    yPosition: 300
  },
  {
    id: 'stop-2',
    buildingId: 'sather-gate',
    buildingName: 'Sather Gate',
    title: 'Historic Sather Gate',
    description: 'Walk through the historic entrance to campus where the Free Speech Movement began in 1964.',
    funFact: 'This gate is where Mario Savio gave his famous "bodies upon the gears" speech.',
    duration: 25,
    xPosition: 200,
    yPosition: 400
  },
  {
    id: 'stop-3',
    buildingId: 'doe-library',
    buildingName: 'Doe Library',
    title: 'Academic Heart',
    description: 'Explore the main library, home to millions of books and countless study sessions.',
    funFact: 'Doe Library houses over 3 million books across 12 floors!',
    duration: 35,
    xPosition: 350,
    yPosition: 250
  },
  {
    id: 'stop-4',
    buildingId: 'sproul-plaza',
    buildingName: 'Sproul Plaza',
    title: 'Student Life Hub',
    description: 'Experience the vibrant student life at Sproul Plaza, where clubs and organizations gather.',
    funFact: 'Over 1,000 student organizations are active on campus!',
    duration: 20,
    xPosition: 300,
    yPosition: 380
  },
  {
    id: 'stop-5',
    buildingId: 'memorial-stadium',
    buildingName: 'Memorial Stadium',
    title: 'Go Bears!',
    description: 'End your tour at the home of Cal Bears football, where school spirit runs high.',
    funFact: 'Memorial Stadium was built in 1923 and seats over 63,000 fans!',
    duration: 25,
    xPosition: 600,
    yPosition: 200
  }
]

export function CampusTourMode({ onNavigateToBuilding, isActive, onToggle }: CampusTourModeProps) {
  const [currentStopIndex, setCurrentStopIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showStopDetails, setShowStopDetails] = useState(false)

  const currentStop = TOUR_STOPS[currentStopIndex]
  const progress = ((currentStopIndex + 1) / TOUR_STOPS.length) * 100

  useEffect(() => {
    if (!isActive) {
      setIsPlaying(false)
      setCurrentStopIndex(0)
      setTimeRemaining(0)
      return
    }

    if (currentStop) {
      setTimeRemaining(currentStop.duration)
      onNavigateToBuilding(currentStop.buildingId, currentStop.xPosition, currentStop.yPosition)
      setShowStopDetails(true)
    }
  }, [isActive, currentStopIndex, currentStop, onNavigateToBuilding])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Auto-advance to next stop
            if (currentStopIndex < TOUR_STOPS.length - 1) {
              setCurrentStopIndex(prev => prev + 1)
            } else {
              // Tour completed
              setIsPlaying(false)
              setShowStopDetails(false)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isPlaying, timeRemaining, currentStopIndex])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleNext = () => {
    if (currentStopIndex < TOUR_STOPS.length - 1) {
      setCurrentStopIndex(prev => prev + 1)
    }
  }

  const handleRestart = () => {
    setCurrentStopIndex(0)
    setIsPlaying(false)
    setTimeRemaining(TOUR_STOPS[0]?.duration || 0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isActive) {
    return (
      <Card className="absolute top-4 left-4 z-20 w-80">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-berkeley-blue/10 rounded-lg">
              <MapPin className="h-5 w-5 text-berkeley-blue" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-berkeley-blue">Campus Tour</h3>
              <p className="text-sm text-muted-foreground">Explore Berkeley's highlights</p>
            </div>
            <Button onClick={onToggle} className="bg-berkeley-blue hover:bg-berkeley-blue/90">
              Start Tour
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Tour Control Panel */}
      <Card className="absolute top-4 left-4 z-20 w-80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-berkeley-blue flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Campus Tour
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onToggle}>
              Exit Tour
            </Button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Stop {currentStopIndex + 1} of {TOUR_STOPS.length}</span>
              <Badge variant="secondary">{formatTime(timeRemaining)}</Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{currentStop?.buildingName}</h3>
            <p className="text-sm text-muted-foreground">{currentStop?.title}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="flex-1"
            >
              {isPlaying ? (
                <><Pause className="h-4 w-4 mr-2" /> Pause</>
              ) : (
                <><Play className="h-4 w-4 mr-2" /> Play</>
              )}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleNext}
              disabled={currentStopIndex >= TOUR_STOPS.length - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button variant="outline" size="sm" onClick={handleRestart}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowStopDetails(true)}
            className="w-full text-berkeley-blue"
          >
            View Details
          </Button>
        </CardContent>
      </Card>

      {/* Stop Details Modal */}
      <Dialog open={showStopDetails} onOpenChange={setShowStopDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-berkeley-blue" />
              {currentStop?.buildingName}
            </DialogTitle>
          </DialogHeader>
          
          {currentStop && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">{currentStop.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentStop.description}
                </p>
              </div>
              
              <div className="p-3 bg-california-gold/10 rounded-lg border border-california-gold/20">
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-california-gold/20 rounded">
                    <Users className="h-3 w-3 text-california-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-california-gold">Fun Fact</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {currentStop.funFact}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{currentStop.duration}s stop</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>Stop {currentStopIndex + 1}/{TOUR_STOPS.length}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handlePlayPause}
                  className="flex-1 bg-berkeley-blue hover:bg-berkeley-blue/90"
                >
                  {isPlaying ? (
                    <><Pause className="h-4 w-4 mr-2" /> Pause Tour</>
                  ) : (
                    <><Play className="h-4 w-4 mr-2" /> Continue Tour</>
                  )}
                </Button>
                
                {currentStopIndex < TOUR_STOPS.length - 1 && (
                  <Button variant="outline" onClick={handleNext}>
                    <SkipForward className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}