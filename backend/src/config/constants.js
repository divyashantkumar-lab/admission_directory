const path = require('path');

const ROOT_DIR = path.join(__dirname, '..', '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const BACKUPS_DIR = path.join(DATA_DIR, 'backups');

const PORT = parseInt(process.env.PORT || '5000', 10);

const ACTIVE_DATA_FILE = process.env.ACTIVE_DATA_FILE || 'students.csv';
const STUDENT_DATA_PATH = path.join(DATA_DIR, ACTIVE_DATA_FILE);

const FRONTEND_ORIGINS = (
  process.env.FRONTEND_ORIGINS ||
  'http://localhost:5173,http://localhost:5174,https://portfolio.example.com'
)
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const HEADER_MAP = {
  'Student Name': 'name',
  "Email": 'email',
  "email": 'email',
  "Year": 'year',
  "year": 'year',
  "Batch": 'batch',
  'School Name': 'school',
  'Class XII %': 'class12',
  'Class X %': 'class10',
  'JEE Mains %ile': 'jeeMains',
  // LinkedIn – various trailing-space variants in the CSV
  'LinkedIn Profile (URL)': 'linkedin',
  'LinkedIn Profile (URL)  ': 'linkedin',
  'LinkedIn Profile (URL) ': 'linkedin',
  'GitHub Profile (URL)': 'github',
  // YouTube
  'YouTube Profile (URL)': 'youtube',
  'YouTube Profile (URL) ': 'youtube',
  // Instagram
  'Instagram Profile (URL)': 'instagram',
  'Instagram Profile (URL) ': 'instagram',
  // Twitter / X
  'X (Twitter) Profile (URL)': 'twitter',
  'X (Twitter) Profile (URL) ': 'twitter',
  // One-liner – trailing-space variants
  'One-liner Intro': 'oneLiner',
  'One-liner Intro ': 'oneLiner',
  // About / achievement
  'Anything else we should know about you?': 'aboutYou',
  'Anything else we should know about you?  ': 'aboutYou',
  'Anything else we should know about you? ': 'aboutYou',
  'Achivement': 'achievement',
  'Achievement': 'achievement',
  // Links
  'Startup Link (URL)': 'startupLink',
  'Photo': 'photo',
  // Profile metadata
  'Part of Club/ Student Council': 'clubOrCouncil',
  'Class of': 'classOf',
  "City": 'city',
  "State": 'state',
  "Age": 'age',
  // Media
  'Project Vedio': 'projectVideo',
  'Project Video': 'projectVideo',
  'Resume': 'resume',
  // Experience
  'Role (Internship)': 'internshipRole',
  'Internships (company)': 'internshipCompany',
  'OpenSource (Year)': 'openSource',
  'Org Name': 'orgName',
  // Sem 1 project
  'Project Track Sem 1': 'projectTrackSem1',
  'Project Title Sem 1': 'projectTitleSem1',
  'Project Tech Stack Used Sem 1': 'projectStackSem1',
  'Deployment Link Sem 1': 'projectLinkSem1',
  'Video Sem 1': 'projectVideoSem1',
  // Sem 2 project
  'Project Track Sem 2': 'projectTrackSem2',
  'Project Title Sem 2': 'projectTitleSem2',
  'Project Tech Stack Used Sem 2': 'projectStackSem2',
  'Deployment Link Sem 2': 'projectLinkSem2',
  'Video Sem 2': 'projectVideoSem2',
  // Tech
  'Tech Stack and Rating': 'techStack',
};

module.exports = {
  ROOT_DIR,
  DATA_DIR,
  BACKUPS_DIR,
  PORT,
  ACTIVE_DATA_FILE,
  STUDENT_DATA_PATH,
  FRONTEND_ORIGINS,
  HEADER_MAP
};
