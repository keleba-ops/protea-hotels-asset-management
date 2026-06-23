"use client";

import { useEffect, useRef } from "react";
import { Barcode } from "lucide-react";

interface Props {
  value: string;
  label?: string;
  height?: number;
  showPrint?: boolean;
  assetName?: string;
  assetCode?: string;
}

export default function AssetBarcode({
  value, label, height = 60, showPrint = false, assetName, assetCode,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    import("jsbarcode").then((mod) => {
      const JsBarcode = mod.default;
      JsBarcode(svgRef.current, value, {
        format: "CODE128",
        height,
        fontSize: 11,
        margin: 4,
        lineColor: "#1B3464",
        background: "#ffffff",
        displayValue: true,
        font: "monospace",
      });
    });
  }, [value, height]);

  function printBarcodeLabel() {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const dataUrl = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));

    const win = window.open("", "_blank", "width=400,height=300");
    if (!win) return;

    const style = win.document.createElement("style");
    style.textContent = [
      "body{font-family:Arial,sans-serif;text-align:center;padding:16px;margin:0}",
      "img{display:block;margin:0 auto;max-width:260px}",
      "h2{margin:6px 0 2px;font-size:13px;color:#1B3464}",
      "p{margin:0;font-size:10px;color:#666}",
      "@media print{body{padding:0}}",
    ].join("");
    win.document.head.appendChild(style);

    const img = win.document.createElement("img");
    img.src = dataUrl;

    const heading = win.document.createElement("h2");
    heading.textContent = assetName ?? label ?? value;

    const codePara = win.document.createElement("p");
    codePara.textContent = assetCode ?? value;

    const caption = win.document.createElement("small");
    caption.textContent = "Barcode · Protea Hotels by Marriott";
    caption.style.cssText = "font-size:9px;color:#aaa;display:block;margin-top:8px";

    win.document.body.append(img, heading, codePara, caption);
    setTimeout(() => { win.print(); win.close(); }, 400);
  }

  if (!value) {
    return (
      <div className="flex h-16 items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-400">
        No barcode value set
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <svg ref={svgRef} className="max-w-full rounded" />
      {label && <p className="text-center text-xs text-gray-400">{label}</p>}
      {showPrint && (
        <button
          onClick={printBarcodeLabel}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Barcode className="h-4 w-4" /> Print Barcode Label
        </button>
      )}
    </div>
  );
}
