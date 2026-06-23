export const dynamic = "force-dynamic";

import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import { auth } from "@/auth";
import {
  QrCode, Wifi, Barcode, Hand, Clock, CheckCircle2,
  AlertCircle, Info, Copy,
} from "lucide-react";

function StatusBadge({ active, label }: { active: boolean; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
    }`}>
      {active
        ? <CheckCircle2 className="h-3 w-3" />
        : <AlertCircle className="h-3 w-3" />}
      {label ?? (active ? "Active" : "Not configured")}
    </span>
  );
}

function Card({
  icon: Icon, title, badge, children,
}: {
  icon: React.ElementType;
  title: string;
  badge: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-50">
          <Icon className="h-5 w-5 text-navy-600" />
        </div>
        <h2 className="flex-1 font-semibold text-gray-900">{title}</h2>
        {badge}
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-4">
      <span className="w-40 shrink-0 text-xs font-medium uppercase tracking-wide text-gray-400">{label}</span>
      <span className={`text-sm text-gray-800 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-gray-900 px-4 py-3 text-xs text-green-300 leading-relaxed">
      {children}
    </pre>
  );
}

const CHECKPOINTS: [string, string][] = [
  ["CP-LAUNDRY", "Laundry Room"],
  ["CP-MAINTENANCE", "Maintenance Room"],
  ["CP-MAIN-STORE", "Main Store"],
  ["CP-HOUSEKEEPING", "Housekeeping Store"],
  ["CP-POOL", "Pool Area"],
  ["CP-RECEPTION", "Reception"],
  ["CP-KITCHEN", "Kitchen"],
  ["CP-RESTAURANT", "Restaurant"],
  ["CP-GYM", "Gym"],
  ["CP-FLOOR1", "Rooms Floor 1"],
  ["CP-FLOOR2", "Rooms Floor 2"],
  ["CP-FLOOR3", "Rooms Floor 3"],
];

function mask(val: string | undefined) {
  if (!val) return <span className="text-gray-400 italic">not set</span>;
  return (
    <span className="font-mono">
      {"•".repeat(Math.max(0, val.length - 8))}
      <span className="text-navy-700">{val.slice(-8)}</span>
    </span>
  );
}

export default async function IntegrationsPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const rfidKey = process.env.RFID_API_KEY;
  const cronSecret = process.env.CRON_SECRET;
  const appUrl = process.env.NEXTAUTH_URL?.replace("http://localhost:3000", "https://protea-hotels-marriott.vercel.app") ?? "https://your-domain.vercel.app";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <TopBar
          title="Tracking Integrations"
          subtitle="All asset-tracking technologies and connection options"
        />
        <div className="p-6 space-y-5">

          {/* Summary row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: QrCode,   label: "QR Code",       status: true },
              { icon: Wifi,     label: "RFID",           status: !!rfidKey },
              { icon: Barcode,  label: "Barcode",        status: true },
              { icon: Hand,     label: "Manual Entry",   status: true },
            ].map(({ icon: Icon, label, status }) => (
              <div key={label} className={`flex items-center gap-3 rounded-xl border p-4 ${status ? "border-green-100 bg-green-50" : "border-gray-100 bg-white"}`}>
                <Icon className={`h-5 w-5 ${status ? "text-green-600" : "text-gray-400"}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{label}</p>
                  <p className={`text-xs ${status ? "text-green-600" : "text-gray-400"}`}>{status ? "Ready" : "Configure"}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── QR Code ── */}
          <Card icon={QrCode} title="QR Code Scanning" badge={<StatusBadge active />}>
            <p className="text-sm text-gray-600">
              Every asset has a unique QR code that links directly to its smart-move screen. Staff scan the code on any smartphone — no app install required.
            </p>
            <InfoRow label="Scan URL pattern" value={`${appUrl}/scan/[assetId]`} mono />
            <InfoRow label="Trigger" value="Staff scan QR with phone camera" />
            <InfoRow label="Result" value="Smart movement screen — suggests action based on asset status + category" />
            <InfoRow label="Print labels" value="Open any asset → Quick Actions → Print Label" />
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex gap-3">
              <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
              <p className="text-xs text-blue-700">
                QR labels include the asset name, code, and scan URL. Print them on sticky labels and attach to each physical item. Laminated labels work best for linens.
              </p>
            </div>
          </Card>

          {/* ── RFID ── */}
          <Card icon={Wifi} title="RFID Reader Integration" badge={<StatusBadge active={!!rfidKey} label={rfidKey ? "Webhook ready" : "API key not set"} />}>
            <p className="text-sm text-gray-600">
              Fixed RFID readers at each hotel checkpoint automatically log asset movements when a tagged item passes through. Zero staff interaction needed.
            </p>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Webhook endpoint</p>
                <InfoRow label="Method" value="POST" mono />
                <InfoRow label="URL" value={`${appUrl}/api/rfid/movement`} mono />
                <InfoRow label="Auth header" value="x-rfid-api-key" mono />
                {isAdmin && <InfoRow label="API key" value={mask(rfidKey)} />}

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 pt-2">Request payload</p>
                <CodeBlock>{`POST /api/rfid/movement
x-rfid-api-key: <your-key>

{
  "rfidTag":     "TAG-LINEN-001",
  "checkpointId":"CP-LAUNDRY"
}`}</CodeBlock>

                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 pt-2">Success response</p>
                <CodeBlock>{`{
  "success":  true,
  "asset":    "King Duvet Cover",
  "movement": "LAUNDRY_OUT",
  "from":     "Housekeeping Store",
  "to":       "Laundry Room"
}`}</CodeBlock>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Checkpoint map</p>
                <div className="overflow-hidden rounded-lg border border-gray-100">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Checkpoint ID</th>
                        <th className="px-3 py-2 text-left font-medium text-gray-500">Maps to location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {CHECKPOINTS.map(([cp, loc]) => (
                        <tr key={cp} className="hover:bg-gray-50">
                          <td className="px-3 py-1.5 font-mono text-navy-700">{cp}</td>
                          <td className="px-3 py-1.5 text-gray-600">{loc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400">
                  Each asset must have an <span className="font-mono">rfidTag</span> value set (edit asset → RFID Tag field). Movement type is auto-resolved from the asset&apos;s current status and destination checkpoint.
                </p>
              </div>
            </div>

            {!rfidKey && (
              <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 flex gap-3">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <strong>RFID_API_KEY</strong> is not set. Add it to Vercel environment variables to activate the webhook.
                </p>
              </div>
            )}
          </Card>

          {/* ── Barcode ── */}
          <Card icon={Barcode} title="Barcode Scanner" badge={<StatusBadge active label="USB / Bluetooth ready" />}>
            <p className="text-sm text-gray-600">
              USB and Bluetooth barcode scanners work out-of-the-box — they emulate a keyboard, so any text field accepts scanned codes directly.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Tag your assets",
                  body: "Print a barcode label with the asset code (e.g. LN-A3X7K2). Attach to the physical item.",
                },
                {
                  step: "2",
                  title: "Search or record",
                  body: "On Assets page — focus the search bar and scan. On Record Movement — focus the Asset field, scan to auto-select.",
                },
                {
                  step: "3",
                  title: "Movement auto-fills",
                  body: "The matching asset loads instantly. Staff just pick the type and destination, then confirm.",
                },
              ].map(({ step, title, body }) => (
                <div key={step} className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-navy-600 text-xs font-bold text-white">{step}</span>
                    <p className="text-sm font-semibold text-gray-800">{title}</p>
                  </div>
                  <p className="text-xs text-gray-500 pl-8">{body}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex gap-3">
              <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
              <p className="text-xs text-blue-700">
                Asset codes use the format <span className="font-mono font-semibold">LN-XXXXXX</span> (linen), <span className="font-mono font-semibold">EL-XXXXXX</span> (electronics), <span className="font-mono font-semibold">CN-XXXXXX</span> (consumables). Use Code 128 or QR barcode format for best scanner compatibility.
              </p>
            </div>
          </Card>

          {/* ── Automated Crons ── */}
          <Card icon={Clock} title="Automated Monitoring (Cron Jobs)" badge={<StatusBadge active label="4 jobs scheduled" />}>
            <p className="text-sm text-gray-600">
              Vercel runs these jobs daily — no server management needed. Each job requires <span className="font-mono text-xs">CRON_SECRET</span> in environment variables.
            </p>
            <div className="overflow-hidden rounded-lg border border-gray-100">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Job</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Schedule</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">What it does</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Alert raised</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[
                    { path: "/api/cron/expiry",      schedule: "Daily 6:00am", action: "Finds assets expiring within 30 days",              alert: "EXPIRY_SOON" },
                    { path: "/api/cron/par-check",   schedule: "Daily 7:00am", action: "Finds assets below PAR level",                      alert: "LOW_STOCK" },
                    { path: "/api/cron/laundry",     schedule: "Daily 8:00am", action: "Auto-returns items in laundry > 48 hours",           alert: "—" },
                    { path: "/api/cron/maintenance", schedule: "Daily 9:00am", action: "Flags items in maintenance > 7 days",                alert: "MAINTENANCE_DUE" },
                  ].map((row) => (
                    <tr key={row.path} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-navy-700">{row.path}</td>
                      <td className="px-4 py-3 text-gray-600">{row.schedule}</td>
                      <td className="px-4 py-3 text-gray-600">{row.action}</td>
                      <td className="px-4 py-3">
                        {row.alert === "—"
                          ? <span className="text-gray-400">—</span>
                          : <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{row.alert}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {isAdmin && (
              <InfoRow label="Cron secret" value={mask(cronSecret)} />
            )}
          </Card>

          {/* ── Manual Entry ── */}
          <Card icon={Hand} title="Manual Entry" badge={<StatusBadge active label="Always available" />}>
            <p className="text-sm text-gray-600">
              Staff can always log movements manually — no hardware required.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { label: "Record Movement", href: "/tracking/new", desc: "Full form — asset, type, destination, quantity, notes" },
                { label: "Scan / Quick Move", href: "/assets", desc: "Open any asset → Scan / Quick Move for a one-tap flow" },
                { label: "Movement Log", href: "/tracking", desc: "View full history of all recorded movements" },
                { label: "Stock Take", href: "/stock-takes/new", desc: "Count all assets in a location and reconcile variances" },
              ].map(({ label, href, desc }) => (
                <a key={href} href={href} className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 hover:bg-gray-100 transition-colors">
                  <span className="text-sm font-semibold text-navy-700">{label}</span>
                  <span className="text-xs text-gray-500">{desc}</span>
                </a>
              ))}
            </div>
          </Card>

        </div>
      </main>
    </div>
  );
}
