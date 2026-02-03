import { Link } from 'wasp/client/router';

const demos = [
  {
    id: 'store',
    title: 'E-Commerce Store',
    description: 'Search products, manage orders, and explore inventory with instant search.',
    href: '/demo/store',
  },
  {
    id: 'crm',
    title: 'CRM',
    description: 'Manage contacts, companies, deals, and activities with a sales pipeline.',
    href: '/demo/crm',
  },
];

export default function OramaDemoLandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="mb-16">
          <p className="text-sm text-gray-400 tracking-widest uppercase mb-4">Orama Demo</p>
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Demos.</h1>
          <h2 className="text-5xl font-bold text-orange-400">Explore the possibilities.</h2>
        </div>

        {/* Demo Cards */}
        <div className="space-y-4">
          {demos.map((demo, index) => (
            <Link
              key={demo.id}
              to={demo.href as any}
              className="group flex items-center gap-8 p-6 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-5xl font-bold text-orange-400">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {demo.title}
                </h3>
                <p className="text-gray-500">
                  {demo.description}
                </p>
              </div>
              <svg
                className="w-5 h-5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
