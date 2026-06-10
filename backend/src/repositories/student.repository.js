const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const XLSX = require('xlsx');
const { Readable } = require('stream');
const {
  STUDENT_DATA_PATH,
  ACTIVE_DATA_FILE,
  HEADER_MAP,
} = require('../config/constants');

function emailToId(email) {
  const local = String(email || '').split('@')[0].trim().toLowerCase();
  return local.replace(/[^a-z0-9._-]/g, '').replace(/\.+/g, '.');
}

function normalizeRow(rawRow) {
  const normalized = {};
  let c = 0;
  for (const [header, value] of Object.entries(rawRow)) {
    const trimmedHeader = header.trim();
    const key =
    HEADER_MAP[header] ||
    HEADER_MAP[trimmedHeader] ||
    HEADER_MAP[header.replace(/\s+$/g, '')];
    if (key) {
      const valStr = String(value ?? '').trim();
      // Sanitize spreadsheet formula reference errors (#REF!)
      normalized[key] = (valStr === '#REF!' || valStr.includes('#REF!')) ? '' : valStr;
    }
  }
  if (normalized.email) {
    normalized.id = emailToId(normalized.email);
  }
  return normalized;
}

function parseCsvBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const rows = [];
    Readable.from(buffer.toString())
      .pipe(csv())
      .on('data', (row) => rows.push(normalizeRow(row)))
      .on('end', () => resolve(rows.filter((r) => r.email)))
      .on('error', reject);
  });
}

function parseXlsxBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rawRows.map(normalizeRow).filter((r) => r.email);
}

async function readAllFromFile(filePath = STUDENT_DATA_PATH) {
  if (!fs.existsSync(filePath)) {
    return [];
  }
  const ext = path.extname(filePath).toLowerCase();
  const buffer = fs.readFileSync(filePath);
  if (ext === '.csv') {
    return parseCsvBuffer(buffer);
  }
  if (ext === '.xlsx' || ext === '.xls') {
    return parseXlsxBuffer(buffer);
  }
  throw new Error(`Unsupported file extension: ${ext}`);
}

async function readAll() {
  const students = await readAllFromFile(STUDENT_DATA_PATH);
  // console.log("Students: ", students[0]);

  return students;
}

async function findById(id) {
  const students = await readAll();
  const slug = id.trim().toLowerCase();
  return students.find((s) => s.id === slug) || null;
}

module.exports = {
  emailToId,
  readAll,
  findById,
  ACTIVE_DATA_FILE,
};
