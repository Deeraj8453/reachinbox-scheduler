import Papa from 'papaparse';

// Basic practical RFC-style email validation
const isValidEmail = (email: string): boolean => {
  const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return re.test(email);
};

export interface CsvStats {
  detected: number;
  valid: number;
  invalid: number;
  duplicates: number;
  validEmails: string[];
}

export const processCsvContent = (content: string): CsvStats => {
  // Parse with papa parse
  const parsed = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
  });

  let rawEmails: string[] = [];

  if (parsed.meta.fields && parsed.meta.fields.length > 0) {
    // Look for an 'email' column case-insensitively
    const emailField = parsed.meta.fields.find(f => f.toLowerCase().trim() === 'email');
    
    if (emailField) {
      // Extract from the email column
      rawEmails = parsed.data.map((row: any) => row[emailField]?.toString().trim() || '');
    } else {
      // No email header found, re-parse without headers and scan all fields
      const rawParsed = Papa.parse(content, { header: false, skipEmptyLines: true });
      rawEmails = scanAllFieldsForEmails(rawParsed.data);
    }
  } else {
    // Parse again without headers to just scan rows
    const rawParsed = Papa.parse(content, { header: false, skipEmptyLines: true });
    rawEmails = scanAllFieldsForEmails(rawParsed.data);
  }

  // Filter out empty strings
  rawEmails = rawEmails.filter(e => e.length > 0);

  const detected = rawEmails.length;
  let valid = 0;
  let invalid = 0;
  let duplicates = 0;
  const uniqueEmails = new Set<string>();
  const validEmailsArray: string[] = [];

  for (const raw of rawEmails) {
    if (!isValidEmail(raw)) {
      invalid++;
      continue;
    }
    
    const normalized = raw.toLowerCase();
    if (uniqueEmails.has(normalized)) {
      duplicates++;
    } else {
      uniqueEmails.add(normalized);
      validEmailsArray.push(raw); // Keep original casing for sending, though lowercase is fine too
      valid++;
    }
  }

  return {
    detected,
    valid,
    invalid,
    duplicates,
    validEmails: validEmailsArray,
  };
};

const scanAllFieldsForEmails = (data: any[]): string[] => {
  const found: string[] = [];
  for (const row of data) {
    const values = Object.values(row);
    for (const val of values) {
      if (typeof val === 'string') {
        // Find things that look like emails in the string
        const matches = val.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
        if (matches) {
          found.push(...matches.map(m => m.trim()));
        }
      }
    }
  }
  return found;
};
