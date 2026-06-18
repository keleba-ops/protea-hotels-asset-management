"use client";

import { useEffect, useState } from "react";
import { QrCode, Printer } from "lucide-react";

interface Props {
  assetId: string;
  assetName: string;
  assetCode: string;
}

export default function AssetQRCode({ assetId, assetName, assetCode }: Props) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const targetUrl = `${origin}/scan/${assetId}`;

  useEffect(() => {
    // Dynamically import qrcode only on client to avoid SSR issues
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(targetUrl, {
        width: 200,
        margin: 1,
        color: { dark: "#1B3464", light: "#ffffff" },
      }).then(setQrDataUrl);
    });
  }, [targetUrl]);

  function printLabel() {
    const win = window.open("", "_blank", "width=400,height=500");
    if (!win || !qrDataUrl) return;

    const doc = win.document;

    // Build the print document entirely via DOM APIs — no document.write(),
    // no innerHTML. textContent is injection-safe for user-controlled strings.
    const style = doc.createElement("style");
    style.textContent = [
      "body{font-family:Arial,sans-serif;text-align:center;padding:24px;margin:0}",
      "img{width:160px;height:160px;display:block;margin:0 auto}",
      "h2{margin:8px 0 2px;font-size:14px;color:#1B3464}",
      "p{margin:0;font-size:11px;color:#666;font-family:monospace}",
      "small{font-size:9px;color:#aaa;display:block;margin-top:12px}",
      "@media print{body{padding:0}}",
    ].join("");
    doc.head.appendChild(style);

    const qrImg = doc.createElement("img");
    qrImg.src = qrDataUrl; // data: URL — not user input, safe to assign
    qrImg.alt = "QR Code";

    const heading = doc.createElement("h2");
    heading.textContent = assetName; // textContent never parses HTML

    const codePara = doc.createElement("p");
    codePara.textContent = assetCode;

    const caption = doc.createElement("small");
    caption.textContent = "Scan to record movement · Protea Hotels by Marriott";

    doc.body.append(qrImg, heading, codePara, caption);

    // Trigger print after layout is complete, then close the window
    win.addEventListener("load", () => {
      win.print();
      win.close();
    });

    // Fallback for browsers that fire load before images decode
    setTimeout(() => { win.print(); win.close(); }, 600);
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <QrCode className="h-4 w-4 text-gray-400" />
        <h3 className="font-semibold text-gray-900">Asset QR Code</h3>
      </div>

      {qrDataUrl ? (
        <div className="flex flex-col items-center gap-3">
          <img src={qrDataUrl} alt={`QR code for ${assetCode}`} className="h-36 w-36 rounded-lg" />
          <p className="text-center text-xs text-gray-400">
            Scan for one-tap movement recording
          </p>
          <button
            onClick={printLabel}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Printer className="h-4 w-4" /> Print Label
          </button>
        </div>
      ) : (
        <div className="flex h-36 w-full items-center justify-center rounded-lg bg-gray-50">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-navy-600 border-t-transparent" />
        </div>
      )}

      <p className="mt-3 text-center font-mono text-xs text-gray-500">{assetCode}</p>
    </div>
  );
}
