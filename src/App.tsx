import { useState, useEffect, useCallback } from 'react'
import { blink } from './blink/client'
import { OnlineUser } from './types/campus'
import { CampusMap } from './components/CampusMap'
import { OnlineUsersSidebar } from './components/OnlineUsersSidebar'
import { CampusHeader } from './components/CampusHeader'
import { Card } from './components/ui/card'
import { Loader2 } from 'lucide-react'

function App() {
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setCurrentUser(state.user)
      setIsLoading(state.isLoading)
    })

    return unsubscribe
  }, [])

  const initializeUserPresence = useCallback(async () => {
    if (!currentUser) return

    try {
      // Create or update user record
      await blink.db.users.create({
        id: currentUser.id,
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Student',
        avatarUrl: currentUser.photoURL,
        userType: 'student', // Default to student, could be determined by email domain
        isOnline: 1,
        lastSeen: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Failed to initialize user presence:', error)
    }
  }, [currentUser])

  const loadOnlineUsers = useCallback(() => {
    // Mock online users for demo - in production this would use real-time presence
    const mockUsers: OnlineUser[] = [
      {
        id: currentUser?.id || 'current-user',
        displayName: currentUser?.displayName || 'You',
        userType: 'student',
        currentBuilding: 'sproul-plaza',
        xPosition: 280,
        yPosition: 450
      },
      {
        id: 'user1',
        displayName: 'Alice Chen',
        userType: 'student',
        currentBuilding: 'doe-library',
        xPosition: 350,
        yPosition: 250
      },
      {
        id: 'user2',
        displayName: 'Prof. Johnson',
        userType: 'faculty',
        currentBuilding: 'wheeler-hall',
        xPosition: 300,
        yPosition: 200
      },
      {
        id: 'user3',
        displayName: 'Bob Martinez',
        userType: 'student',
        currentBuilding: 'student-union',
        xPosition: 320,
        yPosition: 350
      },
      {
        id: 'user4',
        displayName: 'Dr. Smith',
        userType: 'faculty',
        currentBuilding: 'evans-hall',
        xPosition: 450,
        yPosition: 180
      },
      {
        id: 'user5',
        displayName: 'Sarah Kim',
        userType: 'student',
        currentBuilding: 'campanile',
        xPosition: 400,
        yPosition: 300
      }
    ]
    setOnlineUsers(mockUsers)
  }, [currentUser])

  useEffect(() => {
    if (currentUser) {
      initializeUserPresence()
      loadOnlineUsers()
    }
  }, [currentUser, initializeUserPresence, loadOnlineUsers])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-berkeley-blue" />
          <h2 className="text-lg font-semibold text-berkeley-blue mb-2">
            Loading Berkeley Campus
          </h2>
          <p className="text-sm text-muted-foreground">
            Preparing your virtual campus experience...
          </p>
        </Card>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-berkeley-blue rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">UC</span>
          </div>
          <h2 className="text-xl font-bold text-berkeley-blue mb-2">
            Welcome to UC Berkeley Virtual Campus
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Please sign in to explore the campus and connect with other students and faculty.
          </p>
          <div className="text-xs text-muted-foreground">
            Authentication will redirect you to sign in...
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <CampusHeader currentUser={currentUser} onlineCount={onlineUsers.length} />
      
      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Map Area */}
        <div className="flex-1">
          <CampusMap currentUser={currentUser} />
        </div>
        
        {/* Sidebar */}
        <div className="w-80 p-4">
          <OnlineUsersSidebar 
            onlineUsers={onlineUsers} 
            currentUser={currentUser}
          />
        </div>
      </div>
    </div>
  )
}

export default App