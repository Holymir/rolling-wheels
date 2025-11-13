"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockEvents, mockMembers } from "@/lib/mock-data"
import type { Event } from "@/lib/types"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, MapPin, Clock, Users, Plus, List, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"

type ViewMode = "calendar" | "list"

export default function EventsPage() {
  const { role } = useAuth()
  const [events, setEvents] = useState<Event[]>(mockEvents)
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const isAdmin = role === "admin"
  const currentUserId = mockMembers.find((m) => m.role === role)?.id || "1"

  // Filter events based on user role
  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      if (event.type === "public") return true
      if (event.type === "member" && ["admin", "member", "prospect"].includes(role || "")) return true
      if (event.type === "private" && ["admin", "member"].includes(role || "")) return true
      return false
    })
  }, [events, role])

  // Sort events by date
  const sortedEvents = useMemo(() => {
    return [...visibleEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [visibleEvents])

  // Group events by month for calendar view
  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, Event[]> = {}
    sortedEvents.forEach((event) => {
      const monthKey = new Date(event.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
      if (!grouped[monthKey]) grouped[monthKey] = []
      grouped[monthKey].push(event)
    })
    return grouped
  }, [sortedEvents])

  const handleAddEvent = (newEvent: Omit<Event, "id" | "rsvpList">) => {
    const event: Event = {
      ...newEvent,
      id: Date.now().toString(),
      rsvpList: [],
    }
    setEvents([...events, event])
    setIsAddModalOpen(false)
  }

  const handleUpdateEvent = (updatedEvent: Event) => {
    setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)))
    setSelectedEvent(null)
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id))
    setSelectedEvent(null)
  }

  const handleRSVP = (eventId: string) => {
    setEvents(
      events.map((event) => {
        if (event.id === eventId) {
          const hasRSVP = event.rsvpList.includes(currentUserId)
          return {
            ...event,
            rsvpList: hasRSVP
              ? event.rsvpList.filter((id) => id !== currentUserId)
              : [...event.rsvpList, currentUserId],
          }
        }
        return event
      }),
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Events Calendar</h1>
          <p className="text-muted-foreground">Upcoming club events and rides</p>
        </div>

        {/* View Toggle and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("calendar")}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Calendar
            </Button>
          </div>

          {isAdmin && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="chrome-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <EventForm onSubmit={handleAddEvent} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Events Display */}
        {viewMode === "list" ? (
          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onRSVP={handleRSVP}
                onEdit={() => setSelectedEvent(event)}
                onDelete={handleDeleteEvent}
                isAdmin={isAdmin}
                hasRSVP={event.rsvpList.includes(currentUserId)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(eventsByMonth).map(([month, monthEvents]) => (
              <div key={month}>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  {month}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {monthEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onRSVP={handleRSVP}
                      onEdit={() => setSelectedEvent(event)}
                      onDelete={handleDeleteEvent}
                      isAdmin={isAdmin}
                      hasRSVP={event.rsvpList.includes(currentUserId)}
                      compact
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {sortedEvents.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No upcoming events</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <EventForm event={selectedEvent} onSubmit={handleUpdateEvent} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface EventCardProps {
  event: Event
  onRSVP: (eventId: string) => void
  onEdit: () => void
  onDelete: (id: string) => void
  isAdmin: boolean
  hasRSVP: boolean
  compact?: boolean
}

function EventCard({ event, onRSVP, onEdit, onDelete, isAdmin, hasRSVP, compact }: EventCardProps) {
  const eventTypeColors = {
    public: "bg-green-600/20 border-green-600/50 text-green-600",
    member: "bg-primary/20 border-primary/50 text-primary",
    private: "bg-destructive/20 border-destructive/50 text-destructive",
  }

  const eventTypeLabels = {
    public: "Public Event",
    member: "Member Event",
    private: "Private Run",
  }

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-6 leather-texture hover:border-primary/50 transition-colors",
        compact && "p-4",
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border",
                eventTypeColors[event.type],
              )}
            >
              {eventTypeLabels[event.type]}
            </span>
          </div>
          <h3 className={cn("font-bold text-foreground", compact ? "text-lg" : "text-xl")}>{event.title}</h3>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">
            {new Date(event.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{event.time}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{event.location}</span>
        </div>

        {!compact && <p className="text-sm text-muted-foreground leading-relaxed pt-2">{event.description}</p>}

        <div className="flex items-center gap-2 text-sm pt-2 border-t border-border">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {event.rsvpList.length} {event.rsvpList.length === 1 ? "person" : "people"} attending
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={hasRSVP ? "default" : "outline"}
          size="sm"
          onClick={() => onRSVP(event.id)}
          className={cn("flex-1", hasRSVP && "chrome-button")}
        >
          {hasRSVP ? "Attending" : "RSVP"}
        </Button>

        {isAdmin && (
          <>
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(event.id)}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </>
        )}
      </div>

      {isAdmin && event.rsvpList.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            RSVP List ({event.rsvpList.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {event.rsvpList.map((memberId) => {
              const member = mockMembers.find((m) => m.id === memberId)
              return member ? (
                <span key={memberId} className="px-2 py-1 bg-muted rounded text-xs text-foreground">
                  {member.roadName}
                </span>
              ) : null
            })}
          </div>
        </div>
      )}
    </div>
  )
}

interface EventFormProps {
  event?: Event
  onSubmit: (event: any) => void
}

function EventForm({ event, onSubmit }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: event?.title || "",
    date: event?.date || new Date().toISOString().split("T")[0],
    time: event?.time || "19:00",
    location: event?.location || "",
    description: event?.description || "",
    type: event?.type || ("public" as const),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(event ? { ...event, ...formData } : formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Monthly Club Meeting"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time *</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Location *</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="Clubhouse"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Event Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData({ ...formData, type: value as Event["type"] })}
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="public">Public Event</SelectItem>
            <SelectItem value="member">Member Event</SelectItem>
            <SelectItem value="private">Private Run</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Public: All access levels • Member: Admin, Member, Prospect • Private: Admin, Member only
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Event details and information..."
          rows={4}
          required
        />
      </div>

      <Button type="submit" className="w-full chrome-button">
        {event ? "Update Event" : "Create Event"}
      </Button>
    </form>
  )
}
