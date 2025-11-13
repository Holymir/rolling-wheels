import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== 'seed-database-now-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[SEED] Starting seed...')

    await prisma.eventRsvp.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.rule.deleteMany()
    await prisma.event.deleteMany()
    await prisma.member.deleteMany()
    await prisma.user.deleteMany()

    console.log('[SEED] Cleared existing data')

    const users = await Promise.all([
      prisma.user.create({
        data: {
          username: 'admin',
          password: await bcrypt.hash('admin123', 10),
          role: 'admin',
        },
      }),
      prisma.user.create({
        data: {
          username: 'john_steel',
          password: await bcrypt.hash('member123', 10),
          role: 'member',
        },
      }),
      prisma.user.create({
        data: {
          username: 'mike_thunder',
          password: await bcrypt.hash('member123', 10),
          role: 'member',
        },
      }),
      prisma.user.create({
        data: {
          username: 'jake_rookie',
          password: await bcrypt.hash('prospect123', 10),
          role: 'prospect',
        },
      }),
      prisma.user.create({
        data: {
          username: 'visitor',
          password: await bcrypt.hash('guest123', 10),
          role: 'guest',
        },
      }),
    ])

    console.log('[SEED] Created users')

    const members = await Promise.all([
      prisma.member.create({
        data: {
          userId: users[1].id,
          roadName: 'Steel',
          realName: 'John Anderson',
          phone: '555-0101',
          email: 'john@steelridersmc.com',
          emergencyContact: 'Jane Anderson - 555-0102',
          joinDate: new Date('2020-03-15'),
        },
      }),
      prisma.member.create({
        data: {
          userId: users[2].id,
          roadName: 'Thunder',
          realName: 'Mike Thompson',
          phone: '555-0201',
          email: 'mike@steelridersmc.com',
          emergencyContact: 'Sarah Thompson - 555-0202',
          joinDate: new Date('2021-06-20'),
        },
      }),
      prisma.member.create({
        data: {
          userId: users[3].id,
          roadName: 'Rookie',
          realName: 'Jake Martinez',
          phone: '555-0301',
          email: 'jake@steelridersmc.com',
          emergencyContact: 'Maria Martinez - 555-0302',
          joinDate: new Date('2024-01-10'),
        },
      }),
    ])

    console.log('[SEED] Created members')

    const events = await Promise.all([
      prisma.event.create({
        data: {
          title: 'Weekly Chapter Meeting',
          date: new Date('2024-12-15T19:00:00'),
          time: '7:00 PM',
          location: 'Clubhouse',
          description: 'Regular chapter meeting to discuss club business and upcoming rides.',
          type: 'member',
        },
      }),
      prisma.event.create({
        data: {
          title: 'Holiday Charity Ride',
          date: new Date('2024-12-20T10:00:00'),
          time: '10:00 AM',
          location: 'Main Street Parking',
          description: 'Annual charity ride to raise funds for local children hospital. All riders welcome!',
          type: 'public',
        },
      }),
      prisma.event.create({
        data: {
          title: 'New Year Party',
          date: new Date('2024-12-31T20:00:00'),
          time: '8:00 PM',
          location: 'Clubhouse',
          description: 'Members-only New Year celebration. Bring your family!',
          type: 'private',
        },
      }),
    ])

    console.log('[SEED] Created events')

    await Promise.all([
      prisma.eventRsvp.create({
        data: {
          eventId: events[0].id,
          memberId: members[0].id,
        },
      }),
      prisma.eventRsvp.create({
        data: {
          eventId: events[0].id,
          memberId: members[1].id,
        },
      }),
      prisma.eventRsvp.create({
        data: {
          eventId: events[1].id,
          memberId: members[0].id,
        },
      }),
      prisma.eventRsvp.create({
        data: {
          eventId: events[1].id,
          memberId: members[2].id,
        },
      }),
    ])

    console.log('[SEED] Created RSVPs')

    await Promise.all([
      prisma.payment.create({
        data: {
          memberId: members[0].id,
          amount: 50.0,
          dueDate: new Date('2024-12-01'),
          paidDate: new Date('2024-11-28'),
          status: 'paid',
          notes: 'December dues',
        },
      }),
      prisma.payment.create({
        data: {
          memberId: members[1].id,
          amount: 50.0,
          dueDate: new Date('2024-12-01'),
          paidDate: new Date('2024-12-02'),
          status: 'paid',
          notes: 'December dues',
        },
      }),
      prisma.payment.create({
        data: {
          memberId: members[2].id,
          amount: 30.0,
          dueDate: new Date('2024-12-01'),
          status: 'pending',
          notes: 'December prospect dues',
        },
      }),
      prisma.payment.create({
        data: {
          memberId: members[0].id,
          amount: 50.0,
          dueDate: new Date('2025-01-01'),
          status: 'pending',
          notes: 'January dues',
        },
      }),
    ])

    console.log('[SEED] Created payments')

    await Promise.all([
      prisma.rule.create({
        data: {
          title: 'Respect and Brotherhood',
          description: 'All members must treat each other with respect and maintain the brotherhood of the club.',
          category: 'general',
          order: 1,
        },
      }),
      prisma.rule.create({
        data: {
          title: 'Meeting Attendance',
          description: 'Members are required to attend at least 75% of chapter meetings unless excused.',
          category: 'meetings',
          order: 2,
        },
      }),
      prisma.rule.create({
        data: {
          title: 'Riding Formation',
          description: 'When riding as a group, maintain staggered formation and follow the road captain signals.',
          category: 'riding',
          order: 3,
        },
      }),
      prisma.rule.create({
        data: {
          title: 'Club Colors',
          description: 'Full patch members must wear their colors when riding or attending club events.',
          category: 'conduct',
          order: 4,
        },
      }),
      prisma.rule.create({
        data: {
          title: 'Dues Payment',
          description: 'Monthly dues must be paid by the 1st of each month. Overdue payments may result in suspension.',
          category: 'general',
          order: 5,
        },
      }),
    ])

    console.log('[SEED] Created rules')
    console.log('[SEED] Seed completed successfully!')

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      users: users.length,
      members: members.length,
      events: events.length,
      note: 'You can now delete this API route for security.'
    })

  } catch (error) {
    console.error('[SEED] Seed failed:', error)
    return NextResponse.json(
      { error: 'Seed failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
