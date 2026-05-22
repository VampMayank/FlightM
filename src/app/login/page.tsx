import Link from 'next/link'
import { login } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plane, ArrowRight } from 'lucide-react'

export default async function LoginPage(props: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const searchParams = await props.searchParams
  const error = searchParams.error
  const message = searchParams.message

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-[440px] space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="rounded-2xl bg-blue-600 p-3 shadow-lg shadow-blue-200">
              <Plane className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 font-medium">
            New to FlightM?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold underline underline-offset-4 decoration-2">
              Create an account
            </Link>
          </p>
        </div>

        <form action={login} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 border border-red-100 font-medium animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700 border border-green-100 font-medium animate-in fade-in slide-in-from-top-1">
              {message}
            </div>
          )}

          <div className="space-y-5">
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
              autoComplete="current-password"
              required
              label="Password"
              placeholder="••••••••"
              className="h-12 text-base border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-5 w-5 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-3 block text-sm font-semibold text-slate-700 cursor-pointer">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="#" className="font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all group">
            Log In
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </div>
    </div>
  )
}
