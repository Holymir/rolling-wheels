import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/events/[id]/rsvp - RSVP to an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if already RSVPed
    const existing = await prisma.eventRsvp.findUnique({
      where: {
        eventId_memberId: {
          eventId: params.id,
          memberId: session.user.memberId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already RSVPed to this event' },
        { status: 400 }
      )
    }

    const rsvp = await prisma.eventRsvp.create({
      data: {
        eventId: params.id,
        memberId: session.user.memberId,
      },
      include: {
        event: true,
        member: {
          select: {
            id: true,
            roadName: true,
          },
        },
      },
    })

    return NextResponse.json(rsvp, { status: 201 })
  } catch (error) {
    console.error('Error creating RSVP:', error)
    return NextResponse.json(
      { error: 'Failed to RSVP to event' },
      { status: 500 }
    )
  }
}

// DELETE /api/events/[id]/rsvp - Cancel RSVP
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user.memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.eventRsvp.delete({
      where: {
        eventId_memberId: {
          eventId: params.id,
          memberId: session.user.memberId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting RSVP:', error)
    return NextResponse.json(
      { error: 'Failed to cancel RSVP' },
      { status: 500 }
    )
  }
}
