import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/payments - Get all payments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If not admin, only show own payments
    const where =
      session.user.role === 'admin'
        ? {}
        : { memberId: session.user.memberId || '' }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            roadName: true,
            realName: true,
          },
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}

// POST /api/payments - Create a new payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { memberId, amount, dueDate, status, notes } = body

    const payment = await prisma.payment.create({
      data: {
        memberId,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        status,
        notes,
      },
      include: {
        member: {
          select: {
            id: true,
            roadName: true,
            realName: true,
          },
        },
      },
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    )
  }
}
