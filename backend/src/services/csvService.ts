import { parse } from "csv-parse/sync";

export interface CsvRow {
  content: string;
  channel: string;
  customer_label?: string | undefined;
  created_at?: string | undefined;
}

export interface ParseResult {
  valid: CsvRow[];
  errors: { row: number; reason: string }[];
}

export const parseFeedbackCsv = (fileBuffer: Buffer): ParseResult => {
  const records = parse(fileBuffer, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const valid: CsvRow[] = [];
  const errors: { row: number; reason: string }[] = [];

  records.forEach((record, index) => {
    const rowNum = index + 2;

    if (!record.content || record.content.trim() === "") {
      errors.push({ row: rowNum, reason: "Missing content" });
      return;
    }
    if (!record.channel || record.channel.trim() === "") {
      errors.push({ row: rowNum, reason: "Missing channel" });
      return;
    }

      valid.push({
      content: record.content,
      channel: record.channel,
      customer_label: record.customer_label || undefined,
      created_at: record.created_at || undefined,
    });
  });

  return { valid, errors };
};