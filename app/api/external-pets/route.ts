import { getSupabasePublicServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const limit = Number.parseInt(searchParams.get('limit') || '20', 10)

    const supabase = getSupabasePublicServer()

    let query = supabase
      .from('external_pets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (source) {
      query = query.eq('source_id', source)
    }

    const { data: sources, error: sourcesError } = await supabase
      .from('external_sources')
      .select('id, name, url, active, last_parsed')
      .eq('active', true)

    if (sourcesError) {
      console.error('Error fetching sources:', sourcesError)
    }

    const { data: externalPets, error } = await query

    if (error) {
      throw error
    }

    return NextResponse.json({
      pets: externalPets || [],
      sources: sources || [],
    })
  } catch (error) {
    console.error('External pets error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Ошибка при загрузке',
      },
      { status: 500 },
    )
  }
}
