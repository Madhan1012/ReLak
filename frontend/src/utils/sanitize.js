/**
 * sanitizeResumeData — recursively strips raw string artifacts from AI output.
 * Removes: surrounding quotes, \n \r literal escapes, bracket artifacts.
 * Also normalises education entries that arrive as a single garbled string.
 */

const ARTIFACT_RE = /^["'\s]+|["'\s]+$/g;          // leading/trailing quotes & whitespace
const NEWLINE_RE  = /\\n|\\r|\r\n|\r|\n/g;          // literal \n \r and real newlines
const BRACKET_RE  = /^\[|\]$/g;                      // leading [ or trailing ]

function cleanString(val) {
  if (typeof val !== 'string') return val;
  return val
    .replace(NEWLINE_RE, ' ')
    .replace(ARTIFACT_RE, '')
    .replace(BRACKET_RE, '')
    .trim();
}

function sanitizeValue(val) {
  if (val === null || val === undefined) return val;
  if (typeof val === 'string') return cleanString(val);
  if (Array.isArray(val))      return val.map(sanitizeValue);
  if (typeof val === 'object') return sanitizeObject(val);
  return val;
}

function sanitizeObject(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = sanitizeValue(v);
  }
  return out;
}

/**
 * Parse an education entry that may have arrived as a single garbled string
 * like: `"Bachelor's of Technology,SRM Institute,2023 - 2027"`
 * or with commas: `"Bachelor's of Technology,SRM Institute,2023 - 2027"`
 * Returns a clean { degree, institution, year } object.
 */
function normaliseEducation(edu) {
  if (!edu || typeof edu !== 'object') return edu;

  // If degree looks like it contains embedded newlines / multiple fields, split it
  const raw = edu.degree || '';
  if (/\\n|\\r|\r|\n|,/.test(raw)) {
    const parts = raw
      .split(/\\n|\\r|\r\n|\r|\n|,/)
      .map(s => s.replace(ARTIFACT_RE, '').trim())
      .filter(Boolean);
    return {
      degree:      parts[0] || edu.degree,
      institution: parts[1] || edu.institution || '',
      year:        parts[2] || edu.year || '',
    };
  }
  return edu;
}

export function sanitizeResumeData(data) {
  if (!data || typeof data !== 'object') return data;

  const clean = sanitizeObject(data);

  // Extra pass: normalise education entries
  if (Array.isArray(clean.education)) {
    clean.education = clean.education.map(normaliseEducation);
  }

  return clean;
}
