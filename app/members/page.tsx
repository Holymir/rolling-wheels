"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockMembers } from "@/lib/mock-data"
import type { Member, UserRole } from "@/lib/types"
import { Navigation } from "@/components/navigation"
import { RoleBadge } from "@/components/role-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Mail, Phone, UserCircle, Calendar } from "lucide-react"

export default function MembersPage() {
  const { role } = useAuth()
  const [members, setMembers] = useState<Member[]>(mockMembers)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)

  // Filter members based on search and role filter
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.roadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.realName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "all" || member.role === roleFilter
      return matchesSearch && matchesRole
    })
  }, [members, searchQuery, roleFilter])

  const handleAddMember = (newMember: Omit<Member, "id">) => {
    const member: Member = {
      ...newMember,
      id: Date.now().toString(),
    }
    setMembers([...members, member])
    setIsAddModalOpen(false)
  }

  const handleUpdateMember = (updatedMember: Member) => {
    setMembers(members.map((m) => (m.id === updatedMember.id ? updatedMember : m)))
    setEditingMember(null)
  }

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id))
  }

  const canEdit = role === "admin"
  const canEditOwn = role === "member"

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Member Directory</h1>
          <p className="text-muted-foreground">Contact information for all club members</p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by road name or real name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="hangaround">Hangaround</SelectItem>
            </SelectContent>
          </Select>

          {canEdit && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="chrome-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Member</DialogTitle>
                </DialogHeader>
                <MemberForm onSubmit={handleAddMember} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              canEdit={canEdit}
              onEdit={() => setEditingMember(member)}
              onDelete={() => handleDeleteMember(member.id)}
            />
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <UserCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No members found</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingMember && (
        <Dialog open={!!editingMember} onOpenChange={() => setEditingMember(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Member</DialogTitle>
            </DialogHeader>
            <MemberForm member={editingMember} onSubmit={handleUpdateMember} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface MemberCardProps {
  member: Member
  canEdit: boolean
  onEdit: () => void
  onDelete: () => void
}

function MemberCard({ member, canEdit, onEdit, onDelete }: MemberCardProps) {
  const { role } = useAuth()
  const showEmergencyContact = role === "admin"

  return (
    <div className="bg-card border border-border rounded-lg p-6 leather-texture hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-1">{member.roadName}</h3>
          <p className="text-sm text-muted-foreground">{member.realName}</p>
        </div>
        <RoleBadge role={member.role} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <a href={`tel:${member.phone}`} className="text-foreground hover:text-primary">
            {member.phone}
          </a>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a href={`mailto:${member.email}`} className="text-foreground hover:text-primary truncate">
            {member.email}
          </a>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Joined: {new Date(member.joinDate).toLocaleDateString()}</span>
        </div>

        {showEmergencyContact && member.emergencyContact && (
          <div className="pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Emergency Contact</p>
            <p className="text-sm text-foreground">{member.emergencyContact}</p>
          </div>
        )}
      </div>

      {canEdit && (
        <div className="flex gap-2 pt-4 border-t border-border">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1 bg-transparent">
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-destructive hover:text-destructive bg-transparent"
          >
            Remove
          </Button>
        </div>
      )}
    </div>
  )
}

interface MemberFormProps {
  member?: Member
  onSubmit: (member: any) => void
}

function MemberForm({ member, onSubmit }: MemberFormProps) {
  const [formData, setFormData] = useState({
    roadName: member?.roadName || "",
    realName: member?.realName || "",
    phone: member?.phone || "",
    email: member?.email || "",
    role: member?.role || ("member" as UserRole),
    emergencyContact: member?.emergencyContact || "",
    joinDate: member?.joinDate || new Date().toISOString().split("T")[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(member ? { ...member, ...formData } : formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roadName">Road Name *</Label>
          <Input
            id="roadName"
            value={formData.roadName}
            onChange={(e) => setFormData({ ...formData, roadName: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="realName">Real Name *</Label>
          <Input
            id="realName"
            value={formData.realName}
            onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
          >
            <SelectTrigger id="role">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="hangaround">Hangaround</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="joinDate">Join Date *</Label>
          <Input
            id="joinDate"
            type="date"
            value={formData.joinDate}
            onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency Contact</Label>
        <Input
          id="emergencyContact"
          value={formData.emergencyContact}
          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          placeholder="Name - Phone"
        />
      </div>

      <Button type="submit" className="w-full chrome-button">
        {member ? "Update Member" : "Add Member"}
      </Button>
    </form>
  )
}
