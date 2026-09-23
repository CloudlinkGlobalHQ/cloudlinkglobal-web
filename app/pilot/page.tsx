import Link from 'next/link'
import type { Metadata } from 'next'
import { Check, X, Lock, Trash2, Database, CalendarClock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Community Pilot',
  description:
    'A free, read-only AWS cost check for local businesses in Forsyth County and North Atlanta. No payment, no card, and Cloudlink cannot change anything in your account.',
}

const CONTACT = 'satvikranga60@gmail.com'

const canSee = [
  'EC2 instance, volume, security group, VPC and subnet settings',
  'CloudWatch usage metrics (for spotting idle resources)',
  'Your AWS bill, through Cost Explorer',
  'The list of S3 buckets and bucket-level settings (encryption, versioning, public access)',
  'RDS database instance and cluster settings',
  'The list of Lambda functions and their settings',
]

const cannotSee = [
  'The contents of your S3 files',
  'Records inside your databases',
  'Your Lambda function code',
  'Create, change, stop or delete anything, in any service',
]

const permissions = [
  'ec2:DescribeInstances', 'ec2:DescribeInstanceStatus', 'ec2:DescribeSecurityGroups', 'ec2:DescribeVpcs',
  'ec2:DescribeSubnets', 'ec2:DescribeVolumes', 'ec2:DescribeRegions', 'ec2:DescribeTags',
  'cloudwatch:GetMetricStatistics', 'cloudwatch:ListMetrics', 'ce:GetCostAndUsage', 'ce:GetCostForecast',
  's3:ListAllMyBuckets', 's3:GetBucketLocation', 's3:GetBucketPublicAccessBlock', 's3:GetBucketEncryption',
  's3:GetBucketVersioning', 's3:GetBucketAcl', 'rds:DescribeDBInstances', 'rds:DescribeDBClusters',
  'lambda:ListFunctions', 'sts:GetCallerIdentity',
]

const steps = [
  { title: 'Create an account', body: 'Sign up at cloudlinkglobal.com. No credit card.' },
  { title: 'Connect AWS (about 5 minutes)', body: 'Download our CloudFormation template and deploy it in your account. It creates one read-only role. We can do this with you on a call.' },
  { title: 'Run a scan', body: 'Cloudlink lists what is costing money without doing anything useful, with a monthly dollar amount next to each item.' },
  { title: 'You decide what to fix', body: 'Cloudlink never changes your account. You apply the fixes you agree with, and we are happy to walk through them.' },
]

const faqs = [
  {
    q: 'Your pricing page mentions 15% of savings. Does that apply?',
    a: 'No. The pilot is free. We are not asking for payment or a card, and nothing turns into a paid plan later. If we ever offer a paid version, we would ask you first and you would be free to say no.',
  },
  {
    q: 'AWS already has Trusted Advisor, Compute Optimizer and Cost Explorer. Why use this?',
    a: 'Those tools are useful, but they are spread across several consoles and most small teams rarely check them. Cloudlink puts the waste in one list with a monthly dollar amount on each item, and during the pilot we walk through the results with you ourselves.',
  },
  {
    q: 'What do you want in return?',
    a: 'Honest feedback: what was useful, what was confusing, and what you would act on. If the results are helpful, we may ask whether we can mention your business. We only do that with your explicit permission.',
  },
  {
    q: 'Who is behind this?',
    a: 'Cloudlink is built by high school students in Forsyth County, Georgia. This pilot is how we are learning whether it helps real businesses.',
  },
]

export default function PilotPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0E1A' }}>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 sm:pt-32">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#10B981]">Community pilot · Fall 2026</p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-[#F1F5F9] sm:text-5xl">
          A free, read-only AWS cost check for local businesses
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#94A3B8]">
          For businesses in Forsyth County and North Atlanta that run on AWS. We find what is costing you money for no
          reason and show what each fix would save per month. It is free, and Cloudlink cannot change anything in your account.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-xl bg-[#10B981] px-5 py-3 text-sm font-semibold text-white hover:bg-[#059669]">
            Sign up for free
          </Link>
          <a href={`mailto:${CONTACT}?subject=Cloudlink%20pilot`} className="rounded-xl border border-[#1E2D4F] px-5 py-3 text-sm font-semibold text-[#F1F5F9] hover:bg-[#141C33]">
            Email us to set up a call
          </a>
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#F1F5F9]">How it works</h2>
          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl border border-[#1E2D4F] bg-[#0F1629] p-5">
                <p className="text-sm font-semibold text-[#10B981]">Step {i + 1}</p>
                <p className="mt-1 font-semibold text-[#F1F5F9]">{s.title}</p>
                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#F1F5F9]">Exactly what Cloudlink can see</h2>
          <p className="mt-3 max-w-2xl text-[#94A3B8]">
            The role our template creates can read how your infrastructure is configured and what it costs. It cannot read
            your data, and it has no permission to change anything.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[#1E2D4F] bg-[#0F1629] p-5">
              <p className="font-semibold text-[#F1F5F9]">Can see</p>
              <ul className="mt-3 space-y-2">
                {canSee.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-[#94A3B8]">
                    <Check size={16} className="mt-1 shrink-0 text-[#10B981]" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-[#1E2D4F] bg-[#0F1629] p-5">
              <p className="font-semibold text-[#F1F5F9]">Cannot see or do</p>
              <ul className="mt-3 space-y-2">
                {cannotSee.map((item) => (
                  <li key={item} className="flex gap-2 text-sm leading-6 text-[#94A3B8]">
                    <X size={16} className="mt-1 shrink-0 text-[#F87171]" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#64748B]">
            One detail: when listing Lambda functions, AWS includes each function&apos;s environment variables in the
            response. Cloudlink keeps only the name, runtime, memory size, code size and last-modified date. It does not
            store environment variables.
          </p>
          <details className="mt-4 rounded-2xl border border-[#1E2D4F] bg-[#0F1629] p-5">
            <summary className="cursor-pointer font-semibold text-[#F1F5F9]">The full permission list (22 actions)</summary>
            <p className="mt-3 text-sm text-[#94A3B8]">
              Every action is a Describe, Get or List call. The role can only be used with the External ID you choose, so
              no one else can use it.
            </p>
            <ul className="mt-3 grid gap-1 font-mono text-xs text-[#94A3B8] sm:grid-cols-2">
              {permissions.map((p) => <li key={p}>{p}</li>)}
            </ul>
          </details>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#F1F5F9]">Your data</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { icon: Database, title: 'Where it is stored', body: 'Scan results are stored in our Postgres database, hosted by Supabase on AWS in US East (N. Virginia).' },
              { icon: Lock, title: 'What we keep to connect', body: 'Only the role ARN and External ID, encrypted. We never ask for your AWS password or access keys.' },
              { icon: CalendarClock, title: 'Cut off access anytime', body: 'Delete the CloudFormation stack in your AWS account. Access ends immediately, without asking us.' },
              { icon: Trash2, title: 'Delete your data', body: `Remove the connection in your dashboard, then email ${CONTACT} and we will delete your scan data within 48 hours.` },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl border border-[#1E2D4F] bg-[#0F1629] p-5">
                <div className="flex items-center gap-2">
                  <c.icon size={16} className="text-[#10B981]" />
                  <p className="font-semibold text-[#F1F5F9]">{c.title}</p>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[#F1F5F9]">Questions</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-[#1E2D4F] bg-[#0F1629] p-5">
                <p className="font-semibold text-[#F1F5F9]">{f.q}</p>
                <p className="mt-2 text-sm leading-6 text-[#94A3B8]">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl border border-[#10B981]/30 bg-[#10B981]/5 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#F1F5F9]">Want to try it?</h2>
          <p className="mt-2 max-w-2xl text-[#94A3B8]">
            Sign up on your own, or email us and we will set it up with you on a 15-minute call.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/signup" className="rounded-xl bg-[#10B981] px-5 py-3 text-sm font-semibold text-white hover:bg-[#059669]">
              Sign up for free
            </Link>
            <a href={`mailto:${CONTACT}?subject=Cloudlink%20pilot`} className="rounded-xl border border-[#1E2D4F] px-5 py-3 text-sm font-semibold text-[#F1F5F9] hover:bg-[#141C33]">
              {CONTACT}
            </a>
          </div>
        </section>

        <p className="mt-10 text-xs leading-5 text-[#64748B]">
          Cloudlink&apos;s findings and savings estimates are informational. You decide which changes to make in your own
          account. See our <Link href="/terms" className="underline">Terms</Link> and{' '}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </main>
    </div>
  )
}
