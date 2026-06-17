import Image from "next/image";
import { Package, Bell, BarChart3, ArrowLeftRight } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = { title: "Sign In — Protea Hotels by Marriott" };

const features = [
  {
    icon: Package,
    title: "Full Asset Visibility",
    desc: "Tag and trace every item — from lobby to laundry, in real time.",
  },
  {
    icon: Bell,
    title: "Intelligent Alerts",
    desc: "Automatic par-level warnings and maintenance notifications.",
  },
  {
    icon: ArrowLeftRight,
    title: "Movement Tracking",
    desc: "Complete check-in / check-out history across every location.",
  },
  {
    icon: BarChart3,
    title: "Instant Reporting",
    desc: "Stock takes and inventory reports available on demand.",
  },
];

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">

      {/* ── Left: brand panel ───────────────────────────────────── */}
      <div className="relative hidden overflow-hidden bg-navy-900 lg:flex lg:w-[46%] lg:flex-col">

        {/* Decorative concentric rings — top-right (protea flower motif) */}
        <div className="pointer-events-none absolute inset-0">
          {[400, 560, 720, 880].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/[0.07]"
              style={{
                width: size,
                height: size,
                top: -(size / 2) + 60,
                right: -(size / 2) + 60,
              }}
            />
          ))}
          {[320, 480, 640].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white/[0.05]"
              style={{
                width: size,
                height: size,
                bottom: -(size / 2),
                left: -(size / 2) + 40,
              }}
            />
          ))}
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-navy-900/40 to-navy-800/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col px-10 py-10">

          {/* Logo on white card */}
          <div className="w-fit rounded-xl bg-white px-5 py-3 shadow-lg">
            <Image
              src="/Protealogo.png"
              alt="Protea Hotels by Marriott"
              width={160}
              height={52}
              className="object-contain"
              priority
            />
          </div>

          {/* Hero headline */}
          <div className="flex flex-1 flex-col justify-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-navy-300">
              Asset Management System
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
              Every Asset.<br />
              Every Floor.<br />
              Every Moment.
            </h1>
            <p className="mt-5 max-w-sm text-base leading-relaxed text-navy-200">
              Complete property asset control built for the Protea Hotels by Marriott standard of excellence.
            </p>

            {/* Feature list */}
            <div className="mt-10 space-y-5">
              {features.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                    <Icon className="h-4 w-4 text-navy-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-navy-300">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-navy-500">
            © {new Date().getFullYear()} Protea Hotels by Marriott. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right: login panel ──────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-6 py-16">

        {/* Mobile-only logo */}
        <div className="mb-10 lg:hidden">
          <Image
            src="/Protealogo.png"
            alt="Protea Hotels by Marriott"
            width={180}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        <div className="w-full max-w-[400px]">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-gray-500">
              Sign in to access the asset management system
            </p>
          </div>

          <LoginForm />
        </div>
      </div>

    </main>
  );
}
