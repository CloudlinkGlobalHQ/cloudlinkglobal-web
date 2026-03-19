import Link from 'next/link'

export const metadata = { title: 'Privacy Policy — Cloudlink Global' }

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
        <p className="text-sm text-gray-400 mb-8">Last updated: March 19, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Information We Collect</h2>
            <p>When you use Cloudlink, we collect information you provide directly: your email address when joining the waitlist, API keys for authentication, and AWS credentials you configure for cloud scanning. We also collect usage data such as scan history, resource counts, and cost snapshots to provide the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. How We Use Your Information</h2>
            <p>We use your information to operate and improve Cloudlink, including: scanning your cloud infrastructure, detecting cost regressions, sending alerts, and displaying dashboards. We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. Data Security</h2>
            <p>Cloud credentials are encrypted at rest using AES-256 encryption. API keys are stored as one-way SHA-256 hashes. All communication between your browser and our servers is encrypted via TLS. We follow industry-standard practices to protect your data.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Data Retention</h2>
            <p>Cost snapshots and regression data are retained for 90 days. Scan history and audit logs are retained for 1 year. You may request deletion of your data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. Third-Party Services</h2>
            <p>We use AWS Cost Explorer APIs to fetch your cost data, OpenAI for action planning, and Slack for alert delivery (when configured by you). We use Formspree for waitlist form submissions. Each third-party service has its own privacy policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Your Rights</h2>
            <p>You may access, update, or delete your data at any time through the dashboard or by contacting us at <a href="mailto:hello@cloudlinkglobal.com" className="text-green-600 hover:underline">hello@cloudlinkglobal.com</a>. You may also request a copy of all data we hold about your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Changes to This Policy</h2>
            <p>We may update this policy from time to time. We will notify you of significant changes via email or through the dashboard.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Contact</h2>
            <p>For questions about this policy, contact us at <a href="mailto:hello@cloudlinkglobal.com" className="text-green-600 hover:underline">hello@cloudlinkglobal.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
