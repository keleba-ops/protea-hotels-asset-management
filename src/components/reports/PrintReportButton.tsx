"use client";

import { FileText } from "lucide-react";

export default function PrintReportButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
    >
      <FileText className="h-3.5 w-3.5" /> Download PDF
    </button>
  );
}
