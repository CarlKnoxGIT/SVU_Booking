import Link from 'next/link'
import { LoginForm } from './login-form'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-6">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="text-xs font-semibold tracking-widest text-indigo-400 uppercase hover:text-indigo-300">
            Swinburne's Virtual Universe
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-white">Sign in</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Staff use your Swinburne email for SSO access.
          </p>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-zinc-600">
          Public event tickets?{' '}
          <Link href="/events" className="text-indigo-400 hover:text-indigo-300">
            Browse upcoming events
          </Link>
        </p>
      </div>
    </main>
  )
}
