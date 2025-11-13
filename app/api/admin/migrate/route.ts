import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')

    if (secret !== 'migrate-database-now-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('📊 Pushing database schema...')

    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss')

    console.log(stdout)
    if (stderr) console.error(stderr)

    return NextResponse.json({
      success: true,
      message: 'Database schema pushed successfully!',
      output: stdout
    })
  } catch (error) {
    console.error('❌ Migration failed:', error)
    return NextResponse.json(
      {
        error: 'Migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
