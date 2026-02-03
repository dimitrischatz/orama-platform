import React from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';

// ─── Sidebar ────────────────────────────────────────────────────────────────

const docsNav = [
  { label: 'Getting Started', items: [{ name: 'Overview', path: '/demo/crm/docs' }] },
  {
    label: 'Features',
    items: [
      { name: 'Dashboard', path: '/demo/crm/docs/dashboard' },
      { name: 'Contacts', path: '/demo/crm/docs/contacts' },
      { name: 'Companies', path: '/demo/crm/docs/companies' },
      { name: 'Deals & Pipeline', path: '/demo/crm/docs/deals' },
      { name: 'Activities', path: '/demo/crm/docs/activities' },
    ],
  },
  { label: 'Guides', items: [{ name: 'Common Workflows', path: '/demo/crm/docs/workflows' }] },
];

function DocsSidebar() {
  const location = useLocation();
  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 overflow-y-auto">
      <div className="px-6 py-5 border-b border-gray-200">
        <Link to="/demo/crm/docs" className="text-lg font-bold text-indigo-600">
          AccelCRM Docs
        </Link>
      </div>
      <nav className="px-4 py-4">
        {docsNav.map(section => (
          <div key={section.label} className="mb-4">
            <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {section.label}
            </p>
            {section.items.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                    active ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200 mt-auto">
        <Link
          to="/demo/crm"
          className="flex items-center px-3 py-2 text-sm text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to CRM
        </Link>
      </div>
    </aside>
  );
}

// ─── Layout ─────────────────────────────────────────────────────────────────

function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white">
      <DocsSidebar />
      <main className="ml-64 flex-1 px-12 py-10 max-w-3xl">{children}</main>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function H1({ children }: { children: React.ReactNode }) {
  return <h1 className="text-3xl font-bold text-gray-900 mb-2">{children}</h1>;
}
function Subtitle({ children }: { children: React.ReactNode }) {
  return <p className="text-lg text-gray-500 mb-8">{children}</p>;
}
function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold text-gray-900 mt-10 mb-3 pb-2 border-b border-gray-200">{children}</h2>;
}
function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">{children}</h3>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-gray-700 leading-relaxed mb-3">{children}</p>;
}
function Badge({ color, children }: { color: 'green' | 'blue' | 'red' | 'gray' | 'purple' | 'amber'; children: React.ReactNode }) {
  const colors = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
    purple: 'bg-purple-100 text-purple-800',
    amber: 'bg-amber-100 text-amber-800',
  };
  return <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>{children}</span>;
}
function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg text-sm text-gray-700">
      {children}
    </div>
  );
}
function Steps({ items }: { items: string[] }) {
  return (
    <ol className="my-4 space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-semibold flex items-center justify-center mt-0.5">
            {i + 1}
          </span>
          <span className="text-gray-700" dangerouslySetInnerHTML={{ __html: item }} />
        </li>
      ))}
    </ol>
  );
}

// ─── Content: Overview ──────────────────────────────────────────────────────

function Overview() {
  return (
    <>
      <H1>AccelCRM Documentation</H1>
      <Subtitle>Your sales pipeline and customer relationship management platform.</Subtitle>

      <P>
        AccelCRM helps sales teams manage their contacts, companies, deals, and day-to-day activities
        from a single interface. This documentation covers every feature of the platform and how to use
        it effectively.
      </P>

      <H2>Platform Overview</H2>
      <table className="w-full text-sm border-collapse my-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 border border-gray-200 font-semibold">Section</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Purpose</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-3 border border-gray-200 font-medium">Dashboard</td><td className="p-3 border border-gray-200">At-a-glance metrics: total contacts, companies, pipeline value, and closed-won revenue. Also shows recent open deals and pending activities.</td></tr>
          <tr><td className="p-3 border border-gray-200 font-medium">Contacts</td><td className="p-3 border border-gray-200">Manage individual people. Each contact has a name, email, phone, job title, associated company, and a status (lead, active, or inactive).</td></tr>
          <tr><td className="p-3 border border-gray-200 font-medium">Companies</td><td className="p-3 border border-gray-200">Manage organizations. Each company has an industry, website, size classification, revenue range, and a status (prospect, customer, or churned).</td></tr>
          <tr><td className="p-3 border border-gray-200 font-medium">Deals</td><td className="p-3 border border-gray-200">Track sales opportunities through a six-stage pipeline. Deals have a dollar value, win probability, and are linked to a contact and optionally a company. Viewable as a Kanban board or list.</td></tr>
          <tr><td className="p-3 border border-gray-200 font-medium">Activities</td><td className="p-3 border border-gray-200">Log and track calls, emails, meetings, tasks, and notes. Activities can be linked to a contact or deal and marked as completed.</td></tr>
        </tbody>
      </table>

      <H2>Navigation</H2>
      <P>The left sidebar provides links to all sections. On mobile screens (under 1024px), the sidebar collapses behind a hamburger menu button.</P>
      <P>At the bottom of the sidebar:</P>
      <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-1">
        <li><strong>Back to Demos</strong> — returns to the demo selection screen.</li>
        <li><strong>Reset Demo</strong> — restores all data to its original seed state. A confirmation dialog appears before resetting.</li>
      </ul>

      <H2>Key Concepts</H2>

      <H3>Statuses</H3>
      <P>Both contacts and companies have status fields indicating where they are in the customer lifecycle:</P>
      <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-1">
        <li><strong>Contacts:</strong> <Badge color="blue">lead</Badge> → <Badge color="green">active</Badge> → <Badge color="gray">inactive</Badge></li>
        <li><strong>Companies:</strong> <Badge color="blue">prospect</Badge> → <Badge color="green">customer</Badge> → <Badge color="red">churned</Badge></li>
      </ul>

      <H3>Pipeline Value</H3>
      <P>
        The pipeline value on the dashboard is a <em>weighted</em> total. It is calculated by summing each open deal's
        value multiplied by its win probability. For example, a $100,000 deal at 50% probability contributes $50,000.
      </P>

      <H3>Data Relationships</H3>
      <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-1">
        <li>A <strong>Contact</strong> can belong to a <strong>Company</strong>.</li>
        <li>A <strong>Deal</strong> is always linked to a <strong>Contact</strong> and optionally to a <strong>Company</strong>.</li>
        <li>An <strong>Activity</strong> can be linked to a <strong>Contact</strong>, a <strong>Deal</strong>, or both.</li>
      </ul>
    </>
  );
}

// ─── Content: Dashboard ─────────────────────────────────────────────────────

function DashboardDocs() {
  return (
    <>
      <H1>Dashboard</H1>
      <Subtitle>A real-time summary of your CRM data at a glance.</Subtitle>

      <P>The Dashboard is the default landing page when you open AccelCRM. It provides a high-level overview of your sales pipeline, contacts, and upcoming work.</P>

      <H2>Metric Cards</H2>
      <P>Four summary cards are displayed across the top:</P>
      <table className="w-full text-sm border-collapse my-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 border border-gray-200 font-semibold">Card</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">What It Shows</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">How It's Calculated</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-3 border border-gray-200 font-medium">Total Contacts</td><td className="p-3 border border-gray-200">People in your CRM</td><td className="p-3 border border-gray-200">Count of all contacts</td></tr>
          <tr><td className="p-3 border border-gray-200 font-medium">Companies</td><td className="p-3 border border-gray-200">Organizations tracked</td><td className="p-3 border border-gray-200">Count of all companies</td></tr>
          <tr><td className="p-3 border border-gray-200 font-medium">Pipeline Value</td><td className="p-3 border border-gray-200">Weighted value of open deals</td><td className="p-3 border border-gray-200">Sum of (deal value × probability) for deals not in closed_won or closed_lost</td></tr>
          <tr><td className="p-3 border border-gray-200 font-medium">Closed Won</td><td className="p-3 border border-gray-200">Total revenue from won deals</td><td className="p-3 border border-gray-200">Sum of value of all closed_won deals</td></tr>
        </tbody>
      </table>

      <H2>Open Deals Section</H2>
      <P>Below the metric cards, the dashboard lists up to <strong>5 most recent open deals</strong>. Each entry shows the deal title, current pipeline stage (as a colored badge), deal value, and win probability percentage.</P>
      <P>A <strong>"View all deals"</strong> link navigates to the full Deals page.</P>

      <H2>Pending Activities Section</H2>
      <P>Shows up to <strong>5 pending (incomplete) activities</strong>. Each entry shows the activity title, type (call, email, meeting, task, or note) as a color-coded badge, and due date if set.</P>
      <P>A <strong>"View all activities"</strong> link navigates to the full Activities page.</P>

      <Callout>
        <strong>Tip:</strong> The dashboard updates in real-time as you add, edit, or remove data. No refresh needed.
      </Callout>
    </>
  );
}

// ─── Content: Contacts ──────────────────────────────────────────────────────

function ContactsDocs() {
  return (
    <>
      <H1>Contacts</H1>
      <Subtitle>Manage the people in your sales pipeline.</Subtitle>

      <P>The Contacts page lets you store and manage information about individual people — leads, active customers, and past contacts.</P>

      <H2>Contact Fields</H2>
      <table className="w-full text-sm border-collapse my-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 border border-gray-200 font-semibold">Field</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Required</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-3 border border-gray-200">First Name</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">Contact's first name.</td></tr>
          <tr><td className="p-3 border border-gray-200">Last Name</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">Contact's last name.</td></tr>
          <tr><td className="p-3 border border-gray-200">Email</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">Must be a valid email address.</td></tr>
          <tr><td className="p-3 border border-gray-200">Phone</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Phone number, any format.</td></tr>
          <tr><td className="p-3 border border-gray-200">Company</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Dropdown of existing companies.</td></tr>
          <tr><td className="p-3 border border-gray-200">Title</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Job title (e.g., "VP Engineering").</td></tr>
          <tr><td className="p-3 border border-gray-200">Status</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">One of: <Badge color="blue">lead</Badge>, <Badge color="green">active</Badge>, or <Badge color="gray">inactive</Badge>.</td></tr>
        </tbody>
      </table>

      <H2>Contact Statuses</H2>
      <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-1">
        <li><Badge color="blue">lead</Badge> — A new prospect not yet a customer.</li>
        <li><Badge color="green">active</Badge> — A current, engaged contact or customer.</li>
        <li><Badge color="gray">inactive</Badge> — A contact no longer active or engaged.</li>
      </ul>

      <H2>Contacts Table</H2>
      <P>The table displays: <strong>Name</strong> (with job title subtitle), <strong>Email</strong>, <strong>Company</strong>, <strong>Status</strong> (colored badge), and <strong>Actions</strong> (Edit and Delete buttons).</P>

      <H2>Search</H2>
      <P>The search bar filters contacts in real-time across first name, last name, email, and company name. Case-insensitive.</P>

      <H2>Adding a Contact</H2>
      <Steps items={[
        'Click the <strong>"Add Contact"</strong> button in the top-right corner.',
        'A modal form appears. Fill in at least First Name, Last Name, and Email.',
        'Optionally select a Company, add Phone, Title, and set Status.',
        'Click <strong>"Add Contact"</strong> at the bottom of the modal to save.',
      ]} />

      <H2>Editing a Contact</H2>
      <Steps items={[
        'Find the contact in the table.',
        'Click the <strong>pencil icon</strong> in the Actions column.',
        'The modal opens pre-filled with current data.',
        'Make changes and click <strong>"Update Contact"</strong>.',
      ]} />

      <H2>Deleting a Contact</H2>
      <Steps items={[
        'Find the contact in the table.',
        'Click the <strong>trash icon</strong> in the Actions column.',
        'Confirm in the deletion dialog.',
      ]} />

      <Callout>
        <strong>Note:</strong> Deleting a contact does not delete deals or activities linked to it. Those records remain but show the contact as unlinked.
      </Callout>
    </>
  );
}

// ─── Content: Companies ─────────────────────────────────────────────────────

function CompaniesDocs() {
  return (
    <>
      <H1>Companies</H1>
      <Subtitle>Track the organizations you do business with.</Subtitle>

      <P>The Companies page lets you manage organizations in your pipeline.</P>

      <H2>Company Fields</H2>
      <table className="w-full text-sm border-collapse my-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 border border-gray-200 font-semibold">Field</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Required</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-3 border border-gray-200">Company Name</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">Name of the organization.</td></tr>
          <tr><td className="p-3 border border-gray-200">Industry</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Industry sector (e.g., "Technology").</td></tr>
          <tr><td className="p-3 border border-gray-200">Website</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Company URL.</td></tr>
          <tr><td className="p-3 border border-gray-200">Size</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">One of: startup, small, medium, or enterprise.</td></tr>
          <tr><td className="p-3 border border-gray-200">Revenue</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Revenue range as free text (e.g., "$1M - $5M").</td></tr>
          <tr><td className="p-3 border border-gray-200">Address</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Physical address.</td></tr>
          <tr><td className="p-3 border border-gray-200">Status</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">One of: <Badge color="blue">prospect</Badge>, <Badge color="green">customer</Badge>, or <Badge color="red">churned</Badge>.</td></tr>
        </tbody>
      </table>

      <H2>Company Statuses</H2>
      <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-1">
        <li><Badge color="blue">prospect</Badge> — Targeting but no deal closed yet.</li>
        <li><Badge color="green">customer</Badge> — Active paying customer.</li>
        <li><Badge color="red">churned</Badge> — Former customer, no longer active.</li>
      </ul>

      <H2>Company Cards</H2>
      <P>Companies are displayed as a <strong>responsive card grid</strong> (3 columns on desktop). Each card shows a building icon, status badge, company name, industry, associated contact count, company size, and Edit/Delete buttons.</P>

      <H2>Search</H2>
      <P>Filters companies in real-time by company name and industry. Case-insensitive.</P>

      <H2>Adding a Company</H2>
      <Steps items={[
        'Click the <strong>"Add Company"</strong> button.',
        'Fill in at least the Company Name.',
        'Optionally add Industry, Website, Size, Revenue, Address, and Status.',
        'Click <strong>"Add Company"</strong> to save.',
      ]} />

      <H2>Editing a Company</H2>
      <Steps items={[
        'Find the company card in the grid.',
        'Click the <strong>Edit</strong> button on the card.',
        'The modal opens pre-filled with the company\'s data.',
        'Make changes and click <strong>"Update Company"</strong>.',
      ]} />

      <H2>Deleting a Company</H2>
      <Steps items={[
        'Find the company card in the grid.',
        'Click the <strong>Delete</strong> button on the card.',
        'Confirm the deletion in the dialog.',
      ]} />

      <Callout>
        <strong>Note:</strong> Deleting a company does not delete contacts or deals associated with it. Those records remain but no longer reference the deleted company.
      </Callout>
    </>
  );
}

// ─── Content: Deals ─────────────────────────────────────────────────────────

function DealsDocs() {
  return (
    <>
      <H1>Deals &amp; Pipeline</H1>
      <Subtitle>Track sales opportunities from lead to close.</Subtitle>

      <P>The Deals page is where you manage your sales pipeline. Every deal represents a sales opportunity with a dollar value and a probability of closing.</P>

      <H2>Deal Fields</H2>
      <table className="w-full text-sm border-collapse my-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 border border-gray-200 font-semibold">Field</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Required</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-3 border border-gray-200">Title</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">Name of the deal.</td></tr>
          <tr><td className="p-3 border border-gray-200">Value ($)</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">Dollar amount of the deal.</td></tr>
          <tr><td className="p-3 border border-gray-200">Stage</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">Current pipeline stage (see below).</td></tr>
          <tr><td className="p-3 border border-gray-200">Contact</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">Primary contact. Selected from existing contacts.</td></tr>
          <tr><td className="p-3 border border-gray-200">Company</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Associated company.</td></tr>
          <tr><td className="p-3 border border-gray-200">Probability (%)</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">Estimated chance of winning, 0–100. Defaults to 50.</td></tr>
          <tr><td className="p-3 border border-gray-200">Expected Close Date</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Target date for closing.</td></tr>
          <tr><td className="p-3 border border-gray-200">Notes</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Free-text notes.</td></tr>
        </tbody>
      </table>

      <H2>Pipeline Stages</H2>
      <P>Deals progress through six stages:</P>
      <table className="w-full text-sm border-collapse my-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 border border-gray-200 font-semibold">Stage</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Description</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Default Probability</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-3 border border-gray-200"><Badge color="gray">Lead</Badge></td><td className="p-3 border border-gray-200">A new, unqualified opportunity.</td><td className="p-3 border border-gray-200">10%</td></tr>
          <tr><td className="p-3 border border-gray-200"><Badge color="blue">Qualified</Badge></td><td className="p-3 border border-gray-200">Prospect's need and budget verified.</td><td className="p-3 border border-gray-200">30%</td></tr>
          <tr><td className="p-3 border border-gray-200"><Badge color="purple">Proposal</Badge></td><td className="p-3 border border-gray-200">A proposal or quote has been sent.</td><td className="p-3 border border-gray-200">50%</td></tr>
          <tr><td className="p-3 border border-gray-200"><Badge color="amber">Negotiation</Badge></td><td className="p-3 border border-gray-200">Terms and pricing being discussed.</td><td className="p-3 border border-gray-200">70%</td></tr>
          <tr><td className="p-3 border border-gray-200"><Badge color="green">Closed Won</Badge></td><td className="p-3 border border-gray-200">Deal successfully closed.</td><td className="p-3 border border-gray-200">100%</td></tr>
          <tr><td className="p-3 border border-gray-200"><Badge color="red">Closed Lost</Badge></td><td className="p-3 border border-gray-200">Deal was lost.</td><td className="p-3 border border-gray-200">0%</td></tr>
        </tbody>
      </table>

      <Callout>
        <strong>Auto-probability:</strong> When you drag a deal to a new stage on the Kanban board, the probability automatically updates to the stage's default value. You can override this by editing the deal.
      </Callout>

      <H2>Board View (Kanban)</H2>
      <P>The default view. Deals are displayed as cards in six columns, one per stage. Each column header shows the stage name, deal count, and total dollar value.</P>
      <P>Each deal card shows: deal title, value (in green), contact name, win probability, and Edit/Delete buttons.</P>

      <H3>Moving deals between stages</H3>
      <P>To move a deal, <strong>drag the deal card</strong> from one column and <strong>drop it</strong> on the target stage column. The stage and probability update automatically.</P>

      <H2>List View</H2>
      <P>Toggle to List view using the view mode button. Displays deals in a table with columns: Deal, Value, Stage, Contact, Probability, and Actions.</P>

      <H2>Adding a Deal</H2>
      <Steps items={[
        'Click the <strong>"Add Deal"</strong> button.',
        'Fill in Title, Value, and select a Contact (required).',
        'Choose the initial Stage, set Probability, and optionally add Company, Expected Close Date, and Notes.',
        'Click <strong>"Add Deal"</strong> to save.',
      ]} />

      <H2>Editing a Deal</H2>
      <Steps items={[
        'Click the <strong>pencil icon</strong> on any deal card (Board) or row (List).',
        'Update fields in the modal.',
        'Click <strong>"Update Deal"</strong>.',
      ]} />

      <H2>Deleting a Deal</H2>
      <Steps items={[
        'Click the <strong>trash icon</strong> on the deal card or row.',
        'Confirm the deletion.',
      ]} />
    </>
  );
}

// ─── Content: Activities ────────────────────────────────────────────────────

function ActivitiesDocs() {
  return (
    <>
      <H1>Activities</H1>
      <Subtitle>Log calls, emails, meetings, tasks, and notes.</Subtitle>

      <P>The Activities page is your task and interaction log. Use it to track every touchpoint with contacts and deals.</P>

      <H2>Activity Fields</H2>
      <table className="w-full text-sm border-collapse my-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 border border-gray-200 font-semibold">Field</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Required</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-3 border border-gray-200">Type</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">One of: call, email, meeting, task, or note.</td></tr>
          <tr><td className="p-3 border border-gray-200">Title</td><td className="p-3 border border-gray-200">Yes</td><td className="p-3 border border-gray-200">Short description of the activity.</td></tr>
          <tr><td className="p-3 border border-gray-200">Description</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Longer details.</td></tr>
          <tr><td className="p-3 border border-gray-200">Contact</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Link to a specific contact.</td></tr>
          <tr><td className="p-3 border border-gray-200">Deal</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">Link to a specific deal.</td></tr>
          <tr><td className="p-3 border border-gray-200">Due Date</td><td className="p-3 border border-gray-200">No</td><td className="p-3 border border-gray-200">When the activity is due.</td></tr>
        </tbody>
      </table>

      <H2>Activity Types</H2>
      <table className="w-full text-sm border-collapse my-4">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left p-3 border border-gray-200 font-semibold">Type</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Color</th>
            <th className="text-left p-3 border border-gray-200 font-semibold">Typical Use</th>
          </tr>
        </thead>
        <tbody>
          <tr><td className="p-3 border border-gray-200"><Badge color="blue">call</Badge></td><td className="p-3 border border-gray-200">Blue</td><td className="p-3 border border-gray-200">Phone calls with contacts.</td></tr>
          <tr><td className="p-3 border border-gray-200"><Badge color="purple">email</Badge></td><td className="p-3 border border-gray-200">Purple</td><td className="p-3 border border-gray-200">Emails sent or to send.</td></tr>
          <tr><td className="p-3 border border-gray-200"><Badge color="green">meeting</Badge></td><td className="p-3 border border-gray-200">Green</td><td className="p-3 border border-gray-200">Scheduled meetings or demos.</td></tr>
          <tr><td className="p-3 border border-gray-200"><Badge color="amber">task</Badge></td><td className="p-3 border border-gray-200">Amber</td><td className="p-3 border border-gray-200">Internal to-dos (e.g., "Prepare contract").</td></tr>
          <tr><td className="p-3 border border-gray-200"><Badge color="gray">note</Badge></td><td className="p-3 border border-gray-200">Gray</td><td className="p-3 border border-gray-200">General notes or observations.</td></tr>
        </tbody>
      </table>

      <H2>Activity Cards</H2>
      <P>Each card shows: a <strong>checkbox</strong> to toggle completion, a <strong>color-coded icon</strong>, the <strong>title</strong> (strikethrough if completed), description, linked contact/deal names, due date, type badge, and Edit/Delete buttons (visible on hover).</P>

      <H2>Filtering Activities</H2>
      <P>Use the filter chips at the top:</P>
      <ul className="list-disc ml-6 mb-4 text-gray-700 space-y-1">
        <li><strong>All</strong> — every activity regardless of status.</li>
        <li><strong>Pending</strong> — only incomplete activities.</li>
        <li><strong>Completed</strong> — only finished activities.</li>
      </ul>

      <H2>Marking an Activity Complete</H2>
      <P>Click the <strong>checkbox</strong> on the left side of any activity card. The activity shows an animated checkmark, displays with strikethrough styling, and moves to the "Completed" filter group. Click again to mark as pending.</P>

      <H2>Adding an Activity</H2>
      <Steps items={[
        'Click the <strong>"Add Activity"</strong> button.',
        'Select the activity Type.',
        'Enter a Title (required).',
        'Optionally add Description, link a Contact, link a Deal, and set a Due Date.',
        'Click <strong>"Add Activity"</strong> to save.',
      ]} />
      <P>New activities always start as <strong>pending</strong>.</P>

      <H2>Editing an Activity</H2>
      <Steps items={[
        'Hover over the activity card to reveal action buttons.',
        'Click the <strong>Edit</strong> button.',
        'Update fields in the modal.',
        'Click <strong>"Update Activity"</strong>.',
      ]} />

      <H2>Deleting an Activity</H2>
      <Steps items={[
        'Hover over the activity card to reveal action buttons.',
        'Click the <strong>Delete</strong> button.',
        'Confirm the deletion.',
      ]} />
    </>
  );
}

// ─── Content: Workflows ─────────────────────────────────────────────────────

function WorkflowsDocs() {
  return (
    <>
      <H1>Common Workflows</H1>
      <Subtitle>Step-by-step guides for typical CRM tasks.</Subtitle>

      <H2>Onboard a New Prospect</H2>
      <P>When a new potential customer reaches out:</P>
      <Steps items={[
        'Go to <strong>Companies</strong> → click <strong>"Add Company"</strong>. Enter name, industry, set status to <strong>prospect</strong>.',
        'Go to <strong>Contacts</strong> → click <strong>"Add Contact"</strong>. Enter details, select the company, set status to <strong>lead</strong>.',
        'Go to <strong>Deals</strong> → click <strong>"Add Deal"</strong>. Set title, estimated value, select the contact, set stage to <strong>Lead</strong>.',
        'Go to <strong>Activities</strong> → click <strong>"Add Activity"</strong>. Create a call or meeting linked to the contact and deal.',
      ]} />

      <H2>Advance a Deal Through the Pipeline</H2>
      <Steps items={[
        'Navigate to the <strong>Deals</strong> page (Board view).',
        'Find the deal card in its current stage column.',
        '<strong>Drag the card</strong> to the next stage column (e.g., "Lead" to "Qualified").',
        'Probability updates automatically. Edit the deal to adjust if needed.',
        'Log a follow-up activity on the <strong>Activities</strong> page.',
      ]} />

      <H2>Close a Deal</H2>
      <Steps items={[
        'On the Deals board, drag the deal to <strong>Closed Won</strong> or <strong>Closed Lost</strong>.',
        'If won: go to <strong>Companies</strong>, edit the company, change status from <strong>prospect</strong> to <strong>customer</strong>.',
        'If won: go to <strong>Contacts</strong>, edit the contact, change status from <strong>lead</strong> to <strong>active</strong>.',
        'Log a <strong>note</strong> activity summarizing the outcome.',
      ]} />

      <H2>Track Daily Activities</H2>
      <Steps items={[
        'Go to <strong>Activities</strong> and filter by <strong>Pending</strong>.',
        'Review your pending calls, emails, meetings, and tasks.',
        'As you complete each one, <strong>click the checkbox</strong> to mark it done.',
        'Add new activities for any follow-ups that arise.',
      ]} />

      <H2>Review Pipeline Health</H2>
      <Steps items={[
        'Go to the <strong>Dashboard</strong>.',
        'Check <strong>Pipeline Value</strong> — the weighted total of open deals. If declining, add new deals or advance existing ones.',
        'Check <strong>Closed Won</strong> to see total revenue.',
        'Review <strong>Open Deals</strong> to see active deals and their stages.',
        'Review <strong>Pending Activities</strong> to make sure nothing is overdue.',
      ]} />

      <H2>Update a Contact's Company</H2>
      <Steps items={[
        'Make sure the new company exists. If not, go to <strong>Companies</strong> and add it.',
        'Go to <strong>Contacts</strong>, find the contact, click <strong>Edit</strong>.',
        'Change the <strong>Company</strong> dropdown to the new company.',
        'Update the <strong>Title</strong> if their role changed.',
        'Click <strong>"Update Contact"</strong> to save.',
      ]} />

      <H2>Reset the Demo</H2>
      <Steps items={[
        'Click <strong>"Reset Demo"</strong> at the bottom of the CRM sidebar.',
        'A confirmation dialog will appear. Click <strong>Confirm</strong>.',
        'All data reverts to the initial seed state.',
      ]} />

      <Callout>
        <strong>Warning:</strong> Resetting the demo permanently discards all changes. This cannot be undone.
      </Callout>
    </>
  );
}

// ─── Page Router ────────────────────────────────────────────────────────────

const pages: Record<string, () => React.ReactElement> = {
  overview: Overview,
  dashboard: DashboardDocs,
  contacts: ContactsDocs,
  companies: CompaniesDocs,
  deals: DealsDocs,
  activities: ActivitiesDocs,
  workflows: WorkflowsDocs,
};

export function CRMDocsPage() {
  const { page } = useParams<{ page?: string }>();
  const Content = pages[page || 'overview'] || Overview;

  return (
    <DocsLayout>
      <Content />
    </DocsLayout>
  );
}
