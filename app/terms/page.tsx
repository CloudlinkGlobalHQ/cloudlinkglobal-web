import Link from 'next/link'

export const metadata = { title: 'Terms of Service — Cloudlink Global' }

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-sm text-green-600 hover:underline">&larr; Back to home</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 19, 2026</p>

        <div className="prose prose-sm prose-gray max-w-none space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Cloudlink ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">2. Description of Service</h2>
            <p>Cloudlink is a deploy-aware AWS cost monitoring platform that detects cost regressions linked to specific deployments. The Service includes cloud infrastructure scanning, cost snapshot collection, regression detection, and alerting.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">3. Account and Access</h2>
            <p>You are responsible for maintaining the security of your API keys and credentials. You must not share your API keys with unauthorized parties. You are responsible for all activity that occurs under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">4. Acceptable Use</h2>
            <p>You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorized access to the Service or its systems; (c) interfere with or disrupt the Service; (d) exceed rate limits or abuse the API; (e) reverse engineer or attempt to extract the source code of the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">5. AWS Credentials</h2>
            <p>When you provide AWS credentials, you grant Cloudlink read-only access to your AWS Cost Explorer and resource metadata. Cloudlink will not modify, create, or delete any resources in your AWS account. Credentials are encrypted at rest and never shared with third parties.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">6. Service Availability</h2>
            <p>We strive to maintain high availability but do not guarantee uninterrupted service. We may perform maintenance with reasonable notice. The Service is provided "as is" without warranty of any kind.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">7. Limitation of Liability</h2>
            <p>Cloudlink provides cost monitoring and alerting as informational tools. We are not liable for any financial decisions made based on the data or alerts provided by the Service. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">8. Termination</h2>
            <p>You may stop using the Service at any time. We may suspend or terminate your access if you violate these terms. Upon termination, your data will be deleted within 30 days unless you request earlier deletion.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">9. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mt-8 mb-3">10. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:satvikranga60@gmail.com" className="text-green-600 hover:underline">satvikranga60@gmail.com</a>.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
