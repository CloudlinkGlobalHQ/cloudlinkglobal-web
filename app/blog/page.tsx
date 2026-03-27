import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Cloudlink Global",
  description:
    "Practical writing on cloud cost optimization, FinOps, deploy attribution, and engineering efficiency.",
  openGraph: {
    title: "The Cloud Cost Blog — Cloudlink Global",
    description: "Practical writing on cloud cost optimization, FinOps, and engineering efficiency.",
    url: "https://cloudlinkglobal.com/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Cloud Cost Blog — Cloudlink Global",
    description: "Practical writing on cloud costs and FinOps.",
  },
};

// ── types ─────────────────────────────────────────────────────────────────────
type Tag = "Cloud Costs" | "DevOps" | "FinOps" | "Engineering" | "AI" | "Cost Optimization";

interface Post {
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  tag: Tag;
  date: string;
  slug: string;
  featured?: boolean;
}

// ── post data ─────────────────────────────────────────────────────────────────
const posts: Post[] = [
  {
    title: "Why AWS Cost Explorer Can't Tell You What Caused Your Bill to Spike",
    excerpt:
      "Cost Explorer is great at showing you what happened. It's terrible at showing you why. Here's what it's missing — and how deploy attribution changes everything.",
    author: "Alex Torres",
    readTime: "8 min read",
    tag: "Cloud Costs",
    date: "Feb 2026",
    slug: "aws-cost-explorer-cant-tell-you-why",
    featured: true,
  },
  {
    title: "The Hidden Cost of Leaving Dev Environments Running Overnight",
    excerpt:
      "Most engineering teams don't realize how much they're burning on idle dev and staging environments. The numbers will surprise you.",
    author: "Sam Patel",
    readTime: "5 min read",
    tag: "DevOps",
    date: "Jan 2026",
    slug: "hidden-cost-dev-environments-overnight",
  },
  {
    title: "How to Set Up FinOps at a 20-Person Startup",
    excerpt:
      "You don't need a dedicated FinOps team to stop wasting money. Here's the practical playbook for small engineering teams.",
    author: "Mia Chen",
    readTime: "7 min read",
    tag: "FinOps",
    date: "Jan 2026",
    slug: "finops-20-person-startup",
  },
  {
    title: "Deploy-Linked Cost Attribution: A Technical Deep Dive",
    excerpt:
      "How we built a system to fingerprint every deploy with a cost baseline — and surface regressions in under an hour. The architecture, the tradeoffs, and what we learned.",
    author: "Alex Torres",
    readTime: "12 min read",
    tag: "Engineering",
    date: "Dec 2025",
    slug: "deploy-linked-cost-attribution-technical-deep-dive",
  },
  {
    title: "AutoStopping vs Always-On: The Real Numbers",
    excerpt:
      "We ran a controlled experiment across 50 dev environments. Here's exactly how much always-on costs versus intelligent AutoStopping.",
    author: "Jordan Lee",
    readTime: "6 min read",
    tag: "Cost Optimization",
    date: "Dec 2025",
    slug: "autostopping-vs-always-on-real-numbers",
  },
  {
    title: "Our MCP Server: How AI Coding Assistants Can Now See Your Cloud Costs",
    excerpt:
      "We built an MCP server so Claude, Cursor, and other AI coding tools can query live cloud costs directly. Here's why it matters and how it works.",
    author: "Mia Chen",
    readTime: "9 min read",
    tag: "AI",
    date: "Nov 2025",
    slug: "mcp-server-ai-coding-assistants-cloud-costs",
  },
];

// ── tag color map ─────────────────────────────────────────────────────────────
const tagColors: Record<Tag, { bg: string; text: string; border: string }> = {
  "Cloud Costs": { bg: "bg-[#10B981]/10", text: "text-[#10B981]", border: "border-[#10B981]/20" },
  DevOps: { bg: "bg-[#059669]/10", text: "text-[#059669]", border: "border-[#059669]/20" },
  FinOps: { bg: "bg-[#10B981]/10", text: "text-[#10B981]", border: "border-[#10B981]/20" },
  Engineering: { bg: "bg-[#F59E0B]/10", text: "text-[#F59E0B]", border: "border-[#F59E0B]/20" },
  AI: { bg: "bg-[#059669]/10", text: "text-[#059669]", border: "border-[#059669]/20" },
  "Cost Optimization": { bg: "bg-[#10B981]/10", text: "text-[#10B981]", border: "border-[#10B981]/20" },
};

function TagBadge({ tag }: { tag: Tag }) {
  const c = tagColors[tag];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${c.bg} ${c.text} ${c.border}`}>
      <Tag size={10} />
      {tag}
    </span>
  );
}

// ── all tags for filter row ───────────────────────────────────────────────────
const allTags: (Tag | "All")[] = ["All", "Cloud Costs", "DevOps", "FinOps", "Engineering", "AI", "Cost Optimization"];

const featuredPost = posts.find((p) => p.featured)!;
const remainingPosts = posts.filter((p) => !p.featured);

export default function BlogPage() {
  return (
    <main className="min-h-screen bg-[#0A0E1A] text-[#F1F5F9]" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* ── HERO ── */}
      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#10B981]">
              Blog
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            The{" "}
            <span className="bg-gradient-to-r from-[#10B981] to-[#059669] bg-clip-text text-transparent">
              Cloud Cost
            </span>{" "}
            Blog
          </h1>
          <p className="text-xl text-[#94A3B8] max-w-xl mx-auto">
            Practical writing on FinOps, deploy attribution, cloud waste, and engineering efficiency.
          </p>
        </div>
      </section>

      {/* ── TAGS FILTER ROW ── */}
      <section className="pb-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-wrap gap-2 justify-center">
            {allTags.map((t) => (
              <button
                key={t}
                className={`text-sm font-medium px-4 py-2 rounded-full border transition-colors duration-200 ${
                  t === "All"
                    ? "bg-[#10B981] border-[#10B981] text-white"
                    : "bg-transparent border-[#1E2D4F] text-[#94A3B8] hover:border-[#10B981]/40 hover:text-[#F1F5F9]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED POST ── */}
      <section className="pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            href={`/blog/${featuredPost.slug}`}
            className="group block bg-[#141C33] border border-[#1E2D4F] rounded-3xl overflow-hidden hover:border-[#10B981]/40 transition-colors duration-200"
          >
            {/* Featured image placeholder */}
            <div className="h-64 bg-gradient-to-br from-[#0F1629] via-[#141C33] to-[#0A0E1A] relative overflow-hidden border-b border-[#1E2D4F] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/10 to-[#059669]/10" />
              <div className="relative z-10 font-mono text-sm space-y-2 text-center px-8">
                <div className="text-[#94A3B8]">AWS Cost Explorer</div>
                <div className="text-2xl font-black text-[#F1F5F9]">What happened ✓</div>
                <div className="text-2xl font-black text-red-400">Why it happened ✗</div>
                <div className="text-xs text-[#10B981] mt-3">Deploy attribution → root cause in minutes</div>
              </div>
              <div className="absolute top-4 left-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-[#10B981] text-white">
                  Featured
                </span>
              </div>
            </div>

            <div className="p-8 md:p-10">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <TagBadge tag={featuredPost.tag} />
                <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                  <Clock size={12} />
                  {featuredPost.readTime}
                </span>
                <span className="text-xs text-[#94A3B8]">{featuredPost.date}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-4 group-hover:text-[#10B981] transition-colors duration-200 leading-snug">
                {featuredPost.title}
              </h2>
              <p className="text-[#94A3B8] text-lg leading-relaxed mb-6 max-w-2xl">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white text-xs font-bold">
                    {featuredPost.author.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <span className="text-sm text-[#94A3B8]">{featuredPost.author}</span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#10B981] group-hover:gap-2.5 transition-all duration-200">
                  Read article <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── ARTICLE GRID ── */}
      <section className="pb-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingPosts.map((post) => {
              const initials = post.author.split(" ").map((n) => n[0]).join("");
              const authorColor = post.tag === "DevOps" || post.tag === "FinOps" ? "#059669" : post.tag === "Engineering" ? "#F59E0B" : "#10B981";
              return (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col bg-[#141C33] border border-[#1E2D4F] rounded-2xl overflow-hidden hover:border-[#10B981]/40 transition-colors duration-200"
                >
                  {/* Mini illustration placeholder */}
                  <div className="h-32 bg-gradient-to-br from-[#0F1629] to-[#141C33] border-b border-[#1E2D4F] flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${authorColor}15 0%, transparent 70%)` }} />
                    <div className="relative z-10 text-center px-4">
                      <div className="text-2xl font-black" style={{ color: authorColor }}>
                        {post.readTime.split(" ")[0]}
                        <span className="text-xs font-normal text-[#94A3B8] ml-1">min</span>
                      </div>
                      <div className="text-xs text-[#94A3B8] mt-1">{post.tag}</div>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <TagBadge tag={post.tag} />
                      <span className="flex items-center gap-1 text-xs text-[#94A3B8]">
                        <Clock size={11} />
                        {post.readTime}
                      </span>
                    </div>

                    <h3 className="text-[#F1F5F9] font-semibold leading-snug group-hover:text-[#10B981] transition-colors duration-200 flex-1">
                      {post.title}
                    </h3>

                    <p className="text-[#94A3B8] text-sm leading-relaxed line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-[#1E2D4F] mt-auto">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ background: authorColor }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-[#F1F5F9]">{post.author}</div>
                          <div className="text-xs text-[#94A3B8]">{post.date}</div>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-[#94A3B8] group-hover:text-[#10B981] group-hover:translate-x-0.5 transition-all duration-200" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER / CTA ── */}
      <section className="py-24 px-4 bg-[#0F1629]">
        <div className="max-w-xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1E2D4F] bg-[#141C33] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#94A3B8] mb-6">
            Newsletter
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F1F5F9] mb-4">
            Cloud cost insights, monthly
          </h2>
          <p className="text-[#94A3B8] mb-8">
            Practical FinOps writing. No vendor spam. Unsubscribe anytime.
          </p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="you@yourcompany.com"
              className="flex-1 bg-[#141C33] border border-[#1E2D4F] rounded-xl px-4 py-3 text-sm text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#10B981]/60 transition-colors"
            />
            <button className="bg-[#10B981] hover:bg-[#3d5ce6] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors duration-200 whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-[#94A3B8] mt-4">No spam. Unsubscribe anytime.</p>
        </div>
      </section>
    </main>
  );
}
