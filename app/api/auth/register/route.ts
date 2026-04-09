import { getSupabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

type RegisterPayload = {
  district?: string
  email?: string
  name?: string
  password?: string
  phone?: string
}

type AuthUserMetadata = {
  district?: string
  name?: string
  phone?: string
}

const ACCOUNT_EXISTS_MESSAGES = [
  'already been registered',
  'already registered',
  'user already exists',
  'user already registered',
]

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as RegisterPayload

    const email = payload.email?.trim() || ''
    const password = payload.password || ''
    const name = payload.name?.trim() || email.split('@')[0] || 'Пользователь'
    const phone = payload.phone?.trim() || ''
    const district = payload.district?.trim() || ''

    if (!email || !password || !phone || !district) {
      return NextResponse.json(
        { error: 'Не заполнены обязательные поля регистрации' },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseServer()
    let authUser = null

    const { data: signUpData, error: signUpError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          district,
          name,
          phone,
        },
      })

    if (signUpError) {
      const normalizedMessage = signUpError.message.toLowerCase()
      const isAccountAlreadyExists = ACCOUNT_EXISTS_MESSAGES.some((message) =>
        normalizedMessage.includes(message),
      )

      if (!isAccountAlreadyExists) {
        return NextResponse.json(
          { error: `Ошибка регистрации: ${signUpError.message}` },
          { status: 400 },
        )
      }

      const { data: existingSignIn, error: existingSignInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        })

      if (existingSignInError || !existingSignIn.user) {
        return NextResponse.json(
          {
            error:
              'Пользователь с таким email уже существует. Попробуйте войти или используйте другой email.',
          },
          { status: 409 },
        )
      }

      authUser = existingSignIn.user
    } else {
      authUser = signUpData.user
    }

    if (!authUser?.id) {
      return NextResponse.json(
        { error: 'Ошибка регистрации: пустой идентификатор пользователя' },
        { status: 500 },
      )
    }

    const authUserMetadata = authUser.user_metadata as AuthUserMetadata | null

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        district: district || authUserMetadata?.district?.trim() || '',
        email,
        id: authUser.id,
        name: name || authUserMetadata?.name?.trim() || email.split('@')[0],
        phone: phone || authUserMetadata?.phone?.trim() || '',
      })
      .select()
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        {
          error:
            profileError?.message || 'Ошибка сохранения профиля пользователя',
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: profile.id,
          email: profile.email,
          name: profile.name,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Не удалось зарегистрировать пользователя',
      },
      { status: 500 },
    )
  }
}
