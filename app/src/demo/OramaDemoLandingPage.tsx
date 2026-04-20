import { Link } from 'wasp/client/router';
import { ArrowRight } from 'lucide-react';

const demos = [
  {
    id: 'store',
    title: 'E-Commerce Admin',
    description: 'Products, orders, returns, inventory.',
    examples: ['Process all pending orders', 'Discount summer items by 20%', 'Show low stock products'],
    href: '/demo/store',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    id: 'crm',
    title: 'Sales CRM',
    description: 'Contacts, deals, pipeline, activities.',
    examples: ['Follow up on overdue deals', 'Add a contact at Vellum Financial', 'Show pipeline by stage'],
    href: '/demo/crm',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function OramaDemoLandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/5 px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-medium text-orange-400">Interactive Demo</span>
          </div>
          <h1 className="mb-3 text-2xl font-bold tracking-tight text-white">
            An AI agent that acts inside your product
          </h1>
          <p className="text-base text-zinc-400 leading-relaxed">
            Orama answers questions, navigates pages, and completes tasks — <span className="text-white font-medium">making every user an expert in your product from day one</span>. Not a chatbot that links to docs. An agent that gets things done.
          </p>
        </div>

        {/* Demo Cards */}
        <div className="grid grid-cols-2 gap-3">
          {demos.map((demo) => (
            <Link
              key={demo.id}
              to={demo.href as any}
              className="group block"
            >
              <div className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-orange-500/25 hover:bg-white/[0.04]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
                    {demo.icon}
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-zinc-600 transition-all group-hover:text-orange-500 group-hover:translate-x-0.5" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-0.5">{demo.title}</h3>
                <p className="text-xs text-zinc-500 mb-4">{demo.description}</p>
                <div className="mt-auto flex flex-wrap gap-1.5">
                  {demo.examples.map((ex, i) => (
                    <span key={i} className="text-[11px] text-zinc-600 bg-white/[0.03] rounded px-2 py-0.5">
                      {ex}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] text-zinc-600">
          Real apps. Real data. No scripts — the agent figures it out.
        </p>
      </div>
    </div>
  );
}
