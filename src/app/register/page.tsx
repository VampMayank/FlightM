import Link from 'next/link'
import { signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plane, UserPlus } from 'lucide-react'

export default async function RegisterPage(props: {
  searchParams: Promise<{ error?: string }>
}) {
  const searchParams = await props.searchParams
  const error = searchParams.error

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 sm:px-6 py-12">
      <div className="w-full max-w-[480px] space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-blue-600 p-3 shadow-lg shadow-blue-200">
              <Plane className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Create Account</h2>
          <p className="text-slate-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4 decoration-2">
              Log in instead
            </Link>
          </p>
        </div>

        <form action={signup} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              label="Full Name"
              placeholder="John Doe"
              className="h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              label="Email Address"
              placeholder="name@example.com"
              className="h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              label="Password"
              placeholder="••••••••"
              className="h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
            </div>
            <label htmlFor="terms" className="ml-3 text-sm font-semibold text-slate-600 cursor-pointer leading-relaxed">
              I agree to the{' '}
              <Link href="#" className="text-blue-600 hover:text-blue-700 font-bold">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="text-blue-600 hover:text-blue-700 font-bold">Privacy Policy</Link>
            </label>
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all group">
            Sign Up
            <UserPlus className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
          </Button>
        </form>
      </div>
    </div>
  )
}
