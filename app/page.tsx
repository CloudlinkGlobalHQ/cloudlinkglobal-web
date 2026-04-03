import Link from "next/link";
import AnimatedShaderHero from "@/components/ui/animated-shader-hero";
import MarketingSavingsCalculator from "./components/MarketingSavingsCalculator";
import {
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Clock,
  CloudOff,
  Cpu,
  GitBranch,
  Globe,
  Mail,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

const problems = [
  {
    icon: Clock,
    color: "#F59E0B",
    title: "The bill arrives weeks after the deploy",
    desc: "By the time Cost Explorer shows you the damage, the regression has already been draining budget for days.",
  },
  {
    icon: AlertTriangle,
    color: "#EF4444",
    title: "Traditional tools show what changed, not why",
    desc: "Finance sees a number move. Engineering still has to reconstruct the service, deploy, and owner behind it.",
  },
  {
    icon: TrendingUp,
    color: "#F59E0B",
    title: "Idle waste compounds quietly",
    desc: "Forgotten staging clusters, oversized databases, and overprovisioned compute keep burning cash until someone notices.",
  },
];

const steps = [
  {
    num: "01",
    title: "Connect your cloud",
    desc: "Use a read-only role to bring AWS, Azure, or GCP cost and resource data into one operator-grade surface.",
  },
  {
    num: "02",
    title: "Establish your baseline",
    desc: "Cloudlink builds service-level baselines so you can see what changed and which deploy or resource caused it.",
  },
  {
    num: "03",
    title: "Act before the bill lands",
    desc: "Catch regressions, stop idle environments, and turn verified savings into operating leverage for the team.",
  },
];

const features = [
  {
    icon: TrendingUp,
    eyebrow: "Core feature",
    title: "Deploy-linked regression detection",
    desc: "Connect spend changes to the exact deploy, service, and time window responsible so engineering can respond immediately.",
    tone: "green",
  },
  {
    icon: Zap,
    eyebrow: "Automation",
    title: "Auto-remediation with approval controls",
    desc: "Generate operator-ready actions for idle environments, overprovisioned resources, and waste patterns before they become finance escalations.",
    tone: "emerald",
  },
  {
    icon: CloudOff,
    eyebrow: "Operations",
    title: "AutoStopping for non-production",
    desc: "Schedule idle dev and staging resources to power down automatically while preserving restart paths for engineers.",
    tone: "green",
  },
  {
    icon: Shield,
    eyebrow: "Governance",
    title: "Budget guardrails and approvals",
    desc: "Turn budget policy into action with thresholds, approval flows, and explicit operator controls.",
    tone: "amber",
  },
  {
    icon: BarChart2,
    eyebrow: "Analytics",
    title: "Unit economics and service cost views",
    desc: "Break spend down by service, resource type, action, or workflow so teams see where savings actually come from.",
    tone: "blue",
  },
  {
    icon: Cpu,
    eyebrow: "Developer workflow",
    title: "AI and MCP integrations",
    desc: "Ask cost questions from the tools your engineers already use and tie answers back to Cloudlink’s verified data.",
    tone: "violet",
  },
];

const integrations = [
  { name: "AWS", dot: "#FF9900" },
  { name: "Azure", dot: "#0078D4" },
  { name: "GCP", dot: "#4285F4" },
  { name: "Kubernetes", dot: "#326CE5" },
  { name: "GitHub", dot: "#F1F5F9" },
  { name: "Slack", dot: "#4A154B" },
  { name: "Terraform", dot: "#7B42BC" },
  { name: "Datadog", dot: "#632CA6" },
  { name: "PagerDuty", dot: "#06AC38" },
  { name: "Linear", dot: "#5E6AD2" },
  { name: "Vercel", dot: "#F1F5F9" },
  { name: "Claude", dot: "#CC785C" },
];

const testimonials = [
  {
    quote:
      "Cloudlink is the first surface we’ve used that helps finance and engineering look at the same cost event and agree on what changed.",
    name: "VP Engineering",
    role: "Series B fintech",
    company: "Payments infrastructure",
    initials: "VP",
    color: "#10B981",
  },
  {
    quote:
      "The product feels operational, not just analytical. We can see a deploy-driven spike and decide what to do next without opening five tabs.",
    name: "Platform Lead",
    role: "Developer tools company",
    company: "Engineering productivity",
    initials: "PL",
    color: "#059669",
  },
  {
    quote:
      "The value isn’t just cost visibility. It’s getting to a defensible explanation quickly enough that the team can actually respond.",
    name: "CTO",
    role: "AI infrastructure company",
    company: "Model serving platform",
    initials: "CT",
    color: "#10B981",
  },
];

const footerCols = [
  {
    heading: "Product",
    links: [
      { label: "Platform", href: "/product" },
      { label: "Pricing", href: "/pricing" },
      { label: "Customers", href: "/customers" },
      { label: "Docs", href: "/docs" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Customers", href: "/customers" },
      { label: "Contact", href: "mailto:hello@cloudlinkglobal.com" },
      { label: "Enterprise", href: "mailto:enterprise@cloudlinkglobal.com" },
      { label: "Support", href: "mailto:support@cloudlinkglobal.com" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Getting Started", href: "/docs" },
      { label: "API Playground", href: "/docs/api-playground" },
      { label: "CLI", href: "/docs/cli" },
      { label: "CI Integration", href: "/docs/ci-integration" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Security Requests", href: "mailto:security@cloudlinkglobal.com" },
      { label: "Data Processing", href: "mailto:privacy@cloudlinkglobal.com" },
    ],
  },
];

function MarketingSparkline() {
  return (
    <div className="rounded-2xl border border-[#1E2D4F] bg-[#10182E] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.32)]">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8FA2C4]">
          payments-service · daily cost
        </span>
        <span className="rounded-full border border-red-500/25 bg-red-500/12 px-2 py-0.5 text-[11px] font-semibold text-red-300">
          Regression detected
        </span>
      </div>
      <svg viewBox="0 0 340 150" className="h-36 w-full" role="img" aria-label="Cost preview chart">
        <defs>
          <linearGradient id="hero-spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M10 118 C45 118, 72 116, 96 114 S146 116, 178 115 S220 116, 244 108 S286 42, 332 110"
          fill="none"
          stroke="#10B981"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M10 118 C45 118, 72 116, 96 114 S146 116, 178 115 S220 116, 244 108 S286 42, 332 110 L332 148 L10 148 Z"
          fill="url(#hero-spark-fill)"
        />
      </svg>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-[#10B981]/20 bg-[#10B981]/10 px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6EE7B7]">
            Verified savings
          </div>
          <div className="mt-2 text-lg font-semibold text-[#ECFDF5]">+$2,340 this month</div>
        </div>
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300">
            Deploy impact
          </div>
          <div className="mt-2 text-lg font-semibold text-[#F8FAFC]">+#a3f9b2 → +$847/mo</div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#0A0E1A]">
      <AnimatedShaderHero
        trustBadge={{
          text: "Deploy-aware FinOps for teams shipping on AWS, Azure, GCP, and Kubernetes.",
        }}
        headline={{
          line1: "Deploy-aware cloud cost",
          line2: "intelligence for modern teams.",
        }}
        subtitle="Cloudlink Global helps engineering teams catch regressions, stop idle environments, and explain every spike back to the deploy, service, or resource that caused it before the monthly bill turns into a surprise."
        stats={[
          { label: "Detection window", value: "Under 2 hours" },
          { label: "Coverage", value: "AWS, Azure, GCP, Kubernetes" },
          { label: "Commercial model", value: "15% of verified savings" },
        ]}
        buttons={{
          primary: {
            text: "Connect your cloud",
            href: "/signup",
          },
          secondary: {
            text: "Explore the platform",
            href: "/product",
          },
        }}
      />
      <div className="relative z-20 mx-auto -mt-24 max-w-7xl px-6 pb-20 lg:-mt-28">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
          <div className="hidden lg:block" />
          <MarketingSparkline />
        </div>
      </div>
    </section>
  );
}

function SocialProofBar() {
  return (
    <section
      className="overflow-hidden border-y border-[#1E2D4F] bg-[#0F1629] py-8"
      aria-label="Supported cloud and workflow platforms"
    >
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-5 text-center text-sm font-medium text-[#8FA2C4]">
          Built for teams operating across cloud, CI, and incident response.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {["AWS", "Azure", "GCP", "Kubernetes", "GitHub", "Slack", "Terraform", "Datadog"].map((name) => (
            <div
              key={name}
              className="flex items-center justify-center rounded-xl border border-[#1E2D4F] bg-[#10182E] px-4 py-3 text-sm font-semibold text-[#94A3B8]"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="bg-[#0A0E1A] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">Why teams buy</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            Your team ships quickly. The cloud bill reacts later.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#94A3B8]">
            Most platforms help you inspect spend after the fact. Cloudlink is built to help operators understand change while there is still time to act.
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
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            Three steps. Zero guesswork.
          </h2>
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

function FeaturesBentoSection() {
  return (
    <section className="bg-[#0A0E1A] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">Platform overview</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            A cloud cost control plane designed for engineering teams.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#94A3B8]">
            Monitor, explain, and act on cost changes from one place without bolting together dashboards, spreadsheets, and incident chat.
          </p>
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

function IntegrationsSection() {
  return (
    <section className="bg-[#0F1629] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">Integrations</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            Cloudlink fits into the systems your team already runs.
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-center gap-2 rounded-2xl border border-[#1E2D4F] bg-[#10182E] px-4 py-4 text-sm font-semibold text-[#E2E8F0]"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: integration.dot }} />
              {integration.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="bg-[#0A0E1A] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">Customer perspective</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            Built for operators who need defensible answers fast.
          </h2>
          <p className="mt-5 text-lg leading-8 text-[#94A3B8]">
            The strongest value signal in Cloudlink is not the chart. It is the speed at which teams can explain, validate, and act on a cloud cost event.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <article key={testimonial.name} className="rounded-3xl border border-[#1E2D4F] bg-[#10182E] p-7">
              <div className="mb-5 flex gap-1 text-[#F59E0B]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={15} fill="currentColor" />
                ))}
              </div>
              <p className="text-sm leading-7 text-[#CBD5E1]">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-[#06261B]"
                  style={{ background: testimonial.color }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#F8FAFC]">{testimonial.name}</div>
                  <div className="text-xs text-[#94A3B8]">
                    {testimonial.role}, {testimonial.company}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCTASection() {
  return (
    <section className="bg-[#0F1629] py-28">
      <div className="mx-auto max-w-5xl px-6">
        <div className="rounded-[32px] border border-[#1E2D4F] bg-[linear-gradient(135deg,#10182E_0%,#0D1528_55%,#0A0E1A_100%)] px-8 py-14 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:px-14">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-[#10B981]">Ready to evaluate</p>
          <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-[#F1F5F9] md:text-5xl">
            Stop paying for cost changes nobody can explain.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[#94A3B8]">
            Connect your cloud, establish a baseline, and let your team see which deploys, services, and environments actually move spend.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="dashboard-primary-button inline-flex min-h-12 items-center justify-center px-6 py-3">
              Connect your cloud
            </Link>
            <Link href="/docs" className="dashboard-secondary-button inline-flex min-h-12 items-center justify-center px-6 py-3">
              Review the docs
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
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#94A3B8]">© 2026 Cloudlink Global</span>
            <span className="rounded-full border border-[#10B981]/20 bg-[#10B981]/10 px-2.5 py-1 text-xs font-semibold text-[#6EE7B7]">
              SOC 2 in progress
            </span>
          </div>
          <div className="flex items-center gap-4">
            {[
              { Icon: Mail, href: "mailto:hello@cloudlinkglobal.com", label: "Email Cloudlink" },
              { Icon: Globe, href: "https://github.com/CloudlinkGlobalHQ", label: "Cloudlink on GitHub" },
              { Icon: GitBranch, href: "/docs/ci-integration", label: "CI integration docs" },
            ].map(({ Icon, href, label }) => (
              <Link
                key={label}
                href={href}
                aria-label={label}
                className="text-[#64748B] transition-colors hover:text-white"
              >
                <Icon size={18} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <main className="bg-[#0A0E1A] text-[#F1F5F9]">
      <HeroSection />
      <SocialProofBar />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesBentoSection />
      <MarketingSavingsCalculator />
      <IntegrationsSection />
      <TestimonialsSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
