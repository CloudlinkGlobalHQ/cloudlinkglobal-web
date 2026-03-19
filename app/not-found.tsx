import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="text-center max-w-md">
        <p className="text-6xl font-bold text-green-600 mb-4">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          href="/"
          className="inline-block bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-6 py-3 rounded-full transition"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
