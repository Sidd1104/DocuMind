import Link from "next/link";
import DocuMindLogo from "@/components/DocuMindLogo";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="min-h-screen bg-ink-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center justify-center mb-8 hover:opacity-90 transition-opacity">
          <DocuMindLogo size="lg" withTagline={false} />
        </Link>
        <div className="bg-white border border-ink-100 rounded-xl2 shadow-soft p-7">
          <h1 className="text-xl font-semibold text-navy-950">{title}</h1>
          <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
        {footer && <p className="text-center text-sm text-ink-500 mt-5">{footer}</p>}
      </div>
    </main>
  );
}
