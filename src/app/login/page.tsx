import Link from 'next/link'
import { LoginForm } from './login-form'
import SwinburneLogo from '@/components/swinburne-logo'

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <Link href="/">
            <SwinburneLogo className="h-10 w-auto" />
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-light text-white">Staff sign in</h1>
            <p className="mt-1 text-sm text-white/40">
              Use your Swinburne email address.
            </p>
          </div>
        </div>

        <LoginForm />

        <p className="mt-8 text-center text-xs text-white/20">
          Public event tickets?{' '}
          <Link href="/events" className="text-swin-red-light hover:text-white transition-colors">
            Browse upcoming events
          </Link>
        </p>
      </div>
    </main>
  )
}
