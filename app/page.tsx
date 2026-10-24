import Link from "next/link";
import AnimatedShaderHero from "@/components/ui/animated-shader-hero";
import MarketingSavingsCalculator from "./components/MarketingSavingsCalculator";
import {
  AlertTriangle,
  Bell,
  Check,
  Clock,
  Lock,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  TrendingUp,
  X,
} from "lucide-react";

const problems = [
  {
    icon: Clock,
    color: "#F59E0B",
    title: "Nobody is watching the bill",
    desc: "At a small team, the AWS bill is the founder's own money, but no one has time to check it every week.",
  },
  {
    icon: AlertTriangle,
    color: "#EF4444",
    title: "Waste is easy to forget",
    desc: "A test server left running, a storage volume from a deleted instance, a database nobody uses anymore. Each one bills every month.",
  },
  {
    icon: TrendingUp,
    color: "#F59E0B",
    title: "The bill doesn't say why",
    desc: "The invoice shows what each service cost, not which instance, volume or database is behind it, or whether anyone still uses it.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connect a read-only role",
    desc: "Deploy our CloudFormation template in your AWS account. It creates one role with 22 Describe, Get and List permissions, locked to an External ID. About 5 minutes.",
  },
  {
    num: "02",
    title: "Cloudlink scans your account",
    desc: "It checks your EC2, EBS, RDS, Lambda, S3 and security group settings and pulls your cost by service from Cost Explorer, then repeats the check on a schedule.",
  },
  {
    num: "03",
    title: "You decide what to fix",
    desc: "You get a list of findings with an estimated monthly saving for each. Cloudlink never changes anything; your team applies the fixes it agrees with.",
  },
];

const features = [
  {
    icon: Search,
    eyebrow: "Waste",
    title: "Idle and unused resources",
    desc: "EC2 instances with almost no CPU use, EBS volumes not attached to anything, stopped RDS databases and Lambda functions that haven't run in weeks.",
  },
  {
    icon: ShieldCheck,
    eyebrow: "Settings",
    title: "Risky configuration",
    desc: "Security groups with ports open to the internet, S3 buckets without a public access block or encryption, and publicly reachable or unencrypted databases.",
  },
  {
    icon: TrendingUp,
    eyebrow: "Spend",
    title: "Cost by service",
    desc: "Your month-to-date AWS spend broken down by service, pulled from Cost Explorer, next to the findings that explain it.",
  },
  {
    icon: Bell,
    eyebrow: "Updates",
    title: "Weekly digest and alerts",
    desc: "A weekly email summary of what Cloudlink found, plus Slack or webhook notifications when a scan finishes.",
  },
  {
    icon: MessageSquare,
    eyebrow: "Questions",
    title: "Ask about your costs",
    desc: "Ask questions about your spend in plain English in the dashboard, and get answers based on your own scan data.",
  },
  {
    icon: Lock,
    eyebrow: "Access",
    title: "Read-only by design",
    desc: "The role can describe, get and list, and nothing else. It can't read your files or database records. Delete the CloudFormation stack and our access ends immediately.",
  },
];

const covered = [
  "EC2 instances and EBS volumes",
  "RDS databases",
  "Lambda functions",
  "S3 bucket-level settings",
  "Security groups",
  "Cost by service (Cost Explorer)",
];

const notYet = [
  "Cost-spike alerts tied to deploys (in development)",
  "VPC and NAT gateways",
  "Load balancers (ELB)",
  "DynamoDB and Kinesis",
  "ElastiCache and OpenSearch",
  "Bedrock",
];

const integrations = [
  { name: "AWS", dot: "#FF9900" },
  { name: "Slack", dot: "#4A154B" },
  { name: "Email", dot: "#10B981" },
  { name: "Webhooks", dot: "#94A3B8" },
];

const footerCols = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/product" },
      { label: "Pricing", href: "/pricing" },
      { label: "Free pilot", href: "/pilot" },
    ],
  },
  {
    heading: "Docs",
    links: [
      { label: "Getting started", href: "/docs" },
      { label: "Setup", href: "/docs/setup" },
      { label: "API reference", href: "/docs/api-reference" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "hello@cloudlinkglobal.com", href: "mailto:hello@cloudlinkglobal.com" },
      { label: "Security questions", href: "mailto:security@cloudlinkglobal.com" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
];

const exampleFindings = [
  { issue: "EC2 instance, average CPU 1.8% for 14 days", fix: "Stop or downsize", saving: "$61/mo" },
  { issue: "200 GB EBS volume not attached to anything", fix: "Snapshot, then delete", saving: "$16/mo" },
  { issue: "Security group with port 22 open to the internet", fix: "Limit it to your IP", saving: "Risk" },
];

function ExampleFindings() {
  return (
    <div className="rounded-2xl border border-[#1E2D4F] bg-[#10182E] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FA2C4]">Example scan results</span>
        <span className="rounded-full border border-[#274064] px-2 py-0.5 text-[11px] font-semibold text-[#9FB0C9]">
          Sample data
        </span>
      </div>
      <ul className="space-y-2.5">
        {exampleFindings.map((f) => (
          <li key={f.issue} className="rounded-xl border border-[#1E2D4F] bg-[#0D1528] p-3">
            <div className="text-xs text-[#94A3B8]">{f.issue}</div>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-sm text-[#F1F5F9]">→ {f.fix}</span>
              <span className="text-xs font-semibold text-[#6EE7B7]">{f.saving}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] leading-5 text-[#64748B]">
        Illustrative example, not a real customer. Savings are estimates from AWS list prices.
      </p>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0A0E1A]">
      <AnimatedShaderHero
        trustBadge={{ text: "Read-only AWS cost monitoring · Free pilot, fall 2026" }}
        headline={{ line1: "Find the AWS spend", line2: "nobody is using." }}
        subtitle="Cloudlink connects to your AWS account with a read-only role, finds idle and unused resources and risky settings, and shows what each fix would save per month. It can't change anything in your account."
        stats={[
          { label: "Access", value: "Read-only, 22 permissions" },
          { label: "Setup", value: "About 5 minutes" },
          { label: "Pricing", value: "15% of verified savings" },
        ]}
        buttons={{
          primary: { text: "Try the free pilot", href: "/pilot" },
          secondary: { text: "How it works", href: "/product" },
        }}
        visual={<ExampleFindings />}
      />
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="bg-[#0A0E1A] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">The problem</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            Small teams pay for things they forgot about.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#94A3B8]">
            AWS has its own cost tools, but they&apos;re spread across several consoles, and most small teams rarely open them.
            Cloudlink puts the waste in one list with a dollar amount on each item.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {problems.map((problem) => (
            <article key={problem.title} className="rounded-3xl border border-[#1E2D4F] bg-[#10182E] p-7">
              <div
                className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ background: `${problem.color}18` }}
              >
                <problem.icon size={22} style={{ color: problem.color }} />
              </div>
              <h3 className="text-xl font-semibold text-[#F8FAFC]">{problem.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#94A3B8]">{problem.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#0F1629] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">How it works</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">Three steps.</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {steps.map((step) => (
            <div key={step.num} className="rounded-3xl border border-[#1E2D4F] bg-[#10182E] p-8">
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-bold text-white">
                {step.num}
              </div>
              <h3 className="text-2xl font-semibold text-[#F8FAFC]">{step.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#94A3B8]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section className="bg-[#0A0E1A] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">What it finds</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            One list of what&apos;s costing you money.
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-[#1E2D4F] bg-[#10182E] p-7">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#274064] bg-[#0A0E1A] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9FB0C9]">
                <feature.icon size={14} className="text-[#10B981]" />
                {feature.eyebrow}
              </div>
              <h3 className="text-xl font-semibold text-[#F8FAFC]">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#94A3B8]">{feature.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoverageSection() {
  return (
    <section className="bg-[#0F1629] py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">Coverage</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            What Cloudlink covers today
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#94A3B8]">Cloudlink works with AWS. Here is exactly what it checks, and what it doesn&apos;t yet.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="rounded-3xl border border-[#1E2D4F] bg-[#10182E] p-7">
            <p className="font-semibold text-[#F8FAFC]">Covered</p>
            <ul className="mt-4 space-y-2.5">
              {covered.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-[#94A3B8]">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#10B981]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-3xl border border-[#1E2D4F] bg-[#10182E] p-7">
            <p className="font-semibold text-[#F8FAFC]">Not covered yet</p>
            <ul className="mt-4 space-y-2.5">
              {notYet.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-[#94A3B8]">
                  <X size={16} className="mt-0.5 shrink-0 text-[#64748B]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function IntegrationsSection() {
  return (
    <section className="bg-[#0A0E1A] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">Works with</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            Updates where your team already is.
          </h2>
        </div>
        <div className="mx-auto grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#1E2D4F] bg-[#10182E] px-4 py-4 text-center text-sm font-semibold text-[#E2E8F0]"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: integration.dot }} />
              {integration.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="bg-[#0F1629] py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">Who we are</p>
        <h2 className="text-3xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-4xl">Built by two student founders in Georgia.</h2>
        <p className="mt-5 text-lg leading-8 text-[#94A3B8]">
          We built Cloudlink to find the money small teams waste on AWS. After an AWS architect reviewed an earlier
          version, we removed every permission that could change a customer&apos;s account, so the role is now strictly
          read-only. This fall we&apos;re running a free pilot to learn what small teams actually need.
        </p>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="bg-[#0A0E1A] py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-[32px] border border-[#1E2D4F] bg-[linear-gradient(135deg,#10182E_0%,#0D1528_55%,#0A0E1A_100%)] px-8 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:px-14">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">Free pilot</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            See what your AWS account is wasting.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#94A3B8]">
            The pilot is free and read-only. We only ask for honest feedback on whether the results are useful.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/pilot" className="dashboard-primary-button inline-flex min-h-12 items-center justify-center px-6 py-3">
              Try the free pilot
            </Link>
            <Link href="/docs" className="dashboard-secondary-button inline-flex min-h-12 items-center justify-center px-6 py-3">
              Read the docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-[#141C33] bg-[#080C17]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {footerCols.map((column) => (
            <div key={column.heading}>
              <p className="mb-4 text-sm font-semibold text-[#F1F5F9]">{column.heading}</p>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-[#94A3B8] transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#141C33] pt-8 sm:flex-row">
          <span className="text-sm text-[#94A3B8]">© 2026 Cloudlink Global</span>
          <Link
            href="mailto:hello@cloudlinkglobal.com"
            aria-label="Email Cloudlink"
            className="text-[#64748B] transition-colors hover:text-white"
          >
            <Mail size={18} />
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="bg-[#0A0E1A] text-[#F1F5F9]">
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CoverageSection />
      <MarketingSavingsCalculator />
      <IntegrationsSection />
      <AboutSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
