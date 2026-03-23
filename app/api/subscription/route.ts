import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cloudlink-agents-production.up.railway.app'

export async function GET() {
  const { userId, getToken } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const token = await getToken()
    const res = await fetch(`${API_URL}/subscription/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      return NextResponse.json({ plan: 'free', status: 'none', clerk_user_id: userId })
    }
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ plan: 'free', status: 'none', clerk_user_id: userId })
  }
}
