import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-center p-8">
      <div className="max-w-lg">
        {/* Logo placeholder */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-white font-black text-2xl">K</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            KITA <span className="text-blue-500">Systems</span>
          </h1>
          <p className="text-gray-500 text-lg">From Struggle to Booked.</p>
        </div>

        <p className="text-gray-400 mb-10 leading-relaxed">
          AI-powered website builder for local service businesses.
          Generate a full booking site in 10 seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition"
          >
            Open Admin Panel
          </Link>
          <Link
            href="/admin/generate"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-xl transition"
          >
            Generate a Site
          </Link>
          <Link
            href="/pitch"
            className="bg-gray-800 hover:bg-gray-700 text-white font-bold px-8 py-4 rounded-xl transition"
          >
            View Pitch Page
          </Link>
        </div>

        <p className="text-gray-700 text-xs mt-12">
          KITA Builder Systems v1 · Built by Denny Martinez
        </p>
      </div>
    </div>
  )
}
