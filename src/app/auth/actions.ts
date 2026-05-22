'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  let redirectPath: string | null = null;
  
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      redirectPath = '/login?error=Email and password are required';
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error.message)
        redirectPath = `/login?error=${encodeURIComponent(error.message)}`;
      } else {
        revalidatePath('/', 'layout')
        redirectPath = '/';
      }
    }
  } catch (error) {
    console.error('Unexpected login error:', error)
    redirectPath = '/login?error=An unexpected error occurred. Please try again.';
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
}

export async function signup(formData: FormData) {
  let redirectPath: string | null = null;

  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string

    if (!email || !password || !fullName) {
      redirectPath = '/register?error=All fields are required';
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        console.error('Signup error:', error.message)
        redirectPath = `/register?error=${encodeURIComponent(error.message)}`;
      } else {
        revalidatePath('/', 'layout')
        redirectPath = '/login?message=Check your email to confirm your account.';
      }
    }
  } catch (error) {
    console.error('Unexpected signup error:', error)
    redirectPath = '/register?error=An unexpected error occurred. Please try again.';
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
}

export async function signOut() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
  } catch (error) {
    console.error('Sign out error:', error)
  }
  redirect('/')
}
