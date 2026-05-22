import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Mail, Calendar, Shield, ArrowRight, Plane } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id')
    .eq('user_id', user.id)

  const bookingCount = bookings?.length || 0

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Your Profile</h1>
          <p className="mt-2 text-gray-500">Manage your account settings and view your activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* User Info Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-10 w-10 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {user.user_metadata?.full_name || 'No Name Provided'}
                    </h2>
                    <p className="text-gray-500">{user.email}</p>
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="p-2 rounded-lg bg-white border border-gray-200">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-medium text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="p-2 rounded-lg bg-white border border-gray-200">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Member Since</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                    <div className="p-2 rounded-lg bg-white border border-gray-200">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Status</p>
                      <p className="text-sm font-medium text-green-600">Active</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 flex justify-end">
                <Button variant="outline" size="sm">
                  Edit Profile
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats/Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
                  <div className="flex items-center gap-3">
                    <Plane className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Total Bookings</span>
                  </div>
                  <span className="text-lg font-black text-blue-600">{bookingCount}</span>
                </div>
              </div>
              <Link href="/my-bookings" className="mt-6 block">
                <Button className="w-full justify-between group">
                  View My Bookings
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
              <h3 className="text-sm font-bold text-red-900 mb-2 uppercase tracking-widest">Danger Zone</h3>
              <p className="text-xs text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <Button variant="danger" size="sm" className="w-full bg-white text-red-600 border-red-200 hover:bg-red-50">
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
