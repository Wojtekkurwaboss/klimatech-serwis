import { Download, FileText } from "lucide-react";
import type { DocumentItem } from "@/config/tenant";

export function DocumentsList({ documents }: { documents: DocumentItem[] }) {
  return (
    <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card shadow-panel">
      {documents.map((doc) => (
        <li key={doc.id}>
          <a
            href={doc.fileUrl}
            className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-accent/60"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-brand">
              <FileText className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{doc.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {doc.description}
              </span>
            </span>
            <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-muted-foreground">
              {doc.fileType}
            </span>
            <Download className="size-4 shrink-0 text-muted-foreground" />
          </a>
        </li>
      ))}
    </ul>
  );
}