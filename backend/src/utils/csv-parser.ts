import { parse } from 'csv-parse/sync';

export interface ParseResult {
  valid: string[];
  invalid: string[];
  duplicates: number;
  total: number;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parseEmailsFromCsv(csvContent: string): ParseResult {
  let emails: string[] = [];
  
  try {
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    });
    
    // Attempt to find email column
    for (const record of records) {
      const rec = record as any;
      const emailField = Object.keys(rec).find(k => k.toLowerCase().includes('email'));
      if (emailField && rec[emailField]) {
        emails.push(rec[emailField].trim());
      } else {
        // Fallback: check all fields
        const values: string[] = Object.values(rec);
        for (const val of values) {
          if (typeof val === 'string' && val.includes('@')) {
            emails.push(val.trim());
          }
        }
      }
    }
  } catch (e) {
    // Fallback to simple regex parsing if CSV is malformed or just plain text
    const matches = csvContent.match(/[^\s,;"']+@[^\s,;"']+\.[^\s,;"']+/g) || [];
    emails = matches.map(m => m.trim());
  }

  const valid = new Set<string>();
  const invalid: string[] = [];
  let duplicates = 0;

  for (const email of emails) {
    if (emailRegex.test(email)) {
      if (valid.has(email)) {
        duplicates++;
      } else {
        valid.add(email);
      }
    } else {
      invalid.push(email);
    }
  }

  return {
    valid: Array.from(valid),
    invalid,
    duplicates,
    total: emails.length,
  };
}
