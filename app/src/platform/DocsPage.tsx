import { BookOpen, Sparkles, Brain, FileText, Rocket } from "lucide-react";

const sectionCard =
  "rounded-2xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800/50";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof BookOpen;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={sectionCard + " p-6"}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-orange-500" />
        <h2 className="text-base font-semibold text-zinc-900 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
        {children}
      </div>
    </div>
  );
}

const mono =
  "rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-xs font-mono";

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl p-6 lg:p-10">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
        Documentation
      </h1>
      <p className="mb-8 text-sm text-zinc-500">
        Core concepts for getting the most out of your Orama agent.
      </p>

      <div className="flex flex-col gap-8">
        {/* Overview */}
        <Section icon={BookOpen} title="How Orama Works">
          <p>
            Orama is an AI agent that lives inside your app. It reads the page your user is on,
            understands what's visible, and can take actions — filling forms, navigating pages,
            clicking buttons, and answering questions.
          </p>
          <p>
            The agent's behavior is shaped by three things you control:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>Base prompt</strong> — always-on instructions that define the agent's
              identity, tone, and rules
            </li>
            <li>
              <strong>Skills</strong> — domain knowledge loaded on demand when relevant
            </li>
            <li>
              <strong>Memories</strong> — lessons the agent saves automatically from past sessions
            </li>
          </ul>
          <p>
            Create a project, configure these three pieces, then grab the integration snippet from
            your project page to embed the widget.
          </p>
        </Section>

        {/* Base Prompt */}
        <Section icon={FileText} title="Writing a Good Base Prompt">
          <p>
            The base prompt is the most important part of your setup. It's sent to the agent on
            every request, so it should contain the context the agent always needs.
          </p>

          <p className="font-medium text-zinc-900 dark:text-white">Include:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>What your app does (one or two sentences)</li>
            <li>The tone and personality you want (e.g. formal, casual, concise)</li>
            <li>
              Global rules the agent should always follow (e.g.{" "}
              <code className={mono}>Always navigate to the page before interacting with its
              elements</code>)
            </li>
            <li>Things the agent should never do (e.g. delete data without confirming first)</li>
          </ul>

          <p className="font-medium text-zinc-900 dark:text-white">Don't include:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Step-by-step workflows or how-to instructions — those belong in skills</li>
            <li>Product documentation or help content — use skills for that too</li>
            <li>CSS selectors or implementation details — the agent reads the visible UI, not source code</li>
          </ul>

          <p>
            Keep it short. The base prompt is loaded on every request, so it should be limited to
            identity and rules — not a knowledge dump. Detailed knowledge goes in skills.
          </p>
        </Section>

        {/* Skills */}
        <Section icon={Sparkles} title="Skills">
          <p>
            Skills are where the agent's actual knowledge lives — how to do things, what things
            mean, and how your product works. Unlike the base prompt (which is always loaded),
            skills are pulled in only when relevant, so the agent stays focused.
          </p>

          <p className="font-medium text-zinc-900 dark:text-white">Good candidates for skills:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Step-by-step workflows (e.g. "How to add a contact", "How to export a report")</li>
            <li>Product documentation or help articles</li>
            <li>Domain-specific terminology or business rules</li>
            <li>Content that changes often (easier to update one skill than rewrite the base prompt)</li>
          </ul>

          <p>
            Each skill has a <strong>name</strong>, a <strong>description</strong>, and the{" "}
            <strong>content</strong> itself. The description matters — the agent uses it to decide
            whether to load the skill for a given request. Write it like a summary: "Explains how to
            configure billing plans and handle subscription upgrades."
          </p>

          <p className="font-medium text-zinc-900 dark:text-white">Auto-generating skills</p>
          <p>
            Instead of writing skills by hand, you can paste a documentation URL. Orama will crawl
            the linked pages and generate skills from the content automatically. Review and edit the
            results — auto-generated skills are a starting point, not a finished product.
          </p>
        </Section>

        {/* Deploying */}
        <Section icon={Rocket} title="Adding Orama to Your App">
          <p>
            Once your project is configured, go to your project page — you'll find a ready-to-copy
            integration snippet with your project ID already filled in.
          </p>

          <p className="font-medium text-zinc-900 dark:text-white">Two options:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>npm package</strong> — install{" "}
              <code className={mono}>@orama-agent/sdk</code> and wrap your app (or part of it)
              with the <code className={mono}>OramaProvider</code> component. Best for React apps
              where you want control over placement.
            </li>
            <li>
              <strong>Script tag</strong> — drop a single{" "}
              <code className={mono}>&lt;script&gt;</code> tag into your HTML. Works with any
              website, no build step needed.
            </li>
          </ul>

          <p className="font-medium text-zinc-900 dark:text-white">Before you deploy:</p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Make sure you have at least a base prompt set up</li>
            <li>
              Generate an API key from the <strong>API Keys</strong> page — you'll need it for the
              integration snippet
            </li>
            <li>Add a few skills so the agent has knowledge to work with</li>
            <li>Test the agent on your app before rolling it out to users</li>
          </ol>

          <p>
            Each <code className={mono}>OramaProvider</code> / script tag creates an independent
            agent session, so you can use different project IDs for different sections of your app
            if needed.
          </p>
        </Section>

        {/* Memories */}
        <Section icon={Brain} title="Memories">
          <p>
            Memories are created automatically by the agent during sessions. When the agent
            discovers something useful — like a form that requires fields in a specific order, or a
            page that loads slowly — it saves that as a memory for future sessions.
          </p>
          <p>
            You can view and manage memories from your project page. Delete ones that are outdated
            or wrong, and edit ones that are almost right. Over time, memories make the agent better
            at handling your specific app without you needing to update the base prompt.
          </p>
        </Section>
      </div>
    </div>
  );
}
