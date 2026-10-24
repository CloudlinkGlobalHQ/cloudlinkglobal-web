import Link from 'next/link'

export const metadata = { title: 'Privacy Policy' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-sm text-green-600 hover:underline">&larr; Back to home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: October 24, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Information We Collect</h2>
            <p>When you use Cloudlink, we collect information you provide directly: your name and email address when you create an account, and the IAM role ARN and External ID you give us to connect AWS. We never ask for your AWS password or access keys. To provide the service we also store the results of each scan: resource settings, usage metrics, cost by service and the findings we generate. We do not read the contents of your S3 files, the records in your databases or your Lambda code.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to operate and improve Cloudlink, including: scanning your cloud infrastructure, detecting cost regressions, sending alerts, and displaying dashboards. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. Data Security</h2>
            <p>The role ARN and External ID you give us are encrypted at rest. The AWS role Cloudlink uses is read-only: it can describe, get and list, and cannot change anything in your account. You can cut off our access at any time by deleting the CloudFormation stack. All communication between your browser and our servers is encrypted with TLS.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Data Retention</h2>
            <p>Cost snapshots and regression data are retained for 90 days. Scan history and audit logs are retained for 1 year. You may request deletion of your data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Third-Party Services</h2>
            <p>We use these services to run Cloudlink: Clerk for sign-in, Stripe for billing, PostHog for product analytics, Anthropic and OpenAI to generate answers and recommendations from your scan data, Resend to send email, Sentry to report errors, and Slack to deliver alerts when you connect it. The website runs on Vercel and our backend runs on Render. Each service only receives what it needs for its job, and each has its own privacy policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Your Rights</h2>
            <p>You may access, update, or delete your data at any time through the dashboard or by contacting us at <a href="mailto:satvikranga60@gmail.com" className="text-green-600 hover:underline">satvikranga60@gmail.com</a>. You may also request a copy of all data we hold about your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of significant changes via email or through the dashboard.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Contact</h2>
            <p>For questions about this policy, contact us at <a href="mailto:satvikranga60@gmail.com" className="text-green-600 hover:underline">satvikranga60@gmail.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
