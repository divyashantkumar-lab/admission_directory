const studentRepository = require('../repositories/student.repository');

function toCard(student) {
  const card = {
    id: student.id,
    name: student.name,
    year: Number.parseInt(student.year),
    batch: student.batch,
    school: student.school,
    oneLiner: student.oneLiner,
    techStack: student.techStack,
    class12: student.class12,
    jeeMains: student.jeeMains,
    linkedin: student.linkedin,
    github: student.github,
    youtube: student.youtube,
    instagram: student.instagram,
    twitter: student.twitter,
    aboutYou: student.aboutYou,
    achievements: student.achievements,
    startupLink: student.startupLink,
    photo: student.photo,
    club: student.club,
    studentCouncil: student.studentCouncil,
    classOf: student.classOf,
    city: student.city,
    // project video (top-level drive/yt link)
    projectVideo: student.projectVideo,
    resume: student.resume,
    internshipRole: student.internshipRole,
    internshipCompany: student.internshipCompany,
    openSource: student.openSource,
    // orgName: student.orgName,
    // Sem 1
    projectTrackSem1: student.projectTrackSem1,
    projectTitleSem1: student.projectTitleSem1,
    projectStackSem1: student.projectStackSem1,
    projectLinkSem1: student.projectLinkSem1,
    projectVideoSem1: student.projectVideoSem1,
    // Sem 2
    projectTrackSem2: student.projectTrackSem2,
    projectTitleSem2: student.projectTitleSem2,
    projectStackSem2: student.projectStackSem2,
    projectLinkSem2: student.projectLinkSem2,
    projectVideoSem2: student.projectVideoSem2,
    profilePicture: student.profilePicture,
  };

  return card;
}

function matchesSearch(student, search) {
  const q = search.toLowerCase();
  const fields = [
    student.name,
    student.city,
    student.oneLiner,
    student.techStack,
    student.batch,
    student.school,
  ];
  return fields.some((f) => String(f || '').toLowerCase().includes(q));
}

async function list({ batch, search, openSource, internship, club, studentCouncil, limit = 24, offset = 0 } = {}) {

  console.log(batch, search, openSource, internship, club, studentCouncil, limit, offset)
  
  let students = await studentRepository.readAll();

  if (batch) {
    students = students.filter(
      (s) => String(s.batch || '').toLowerCase() === batch.toLowerCase()
    );
  }
  if (search) {
    students = students.filter((s) => matchesSearch(s, search));
  }
  if (openSource && openSource !== 'false') {
    students = students.filter((s) => s.openSource && String(s.openSource).trim() !== '');
  }
  if (internship && internship !== 'false') {
    students = students.filter(
      (s) => (s.internshipRole && String(s.internshipRole).trim() !== '') ||
             (s.internshipCompany && String(s.internshipCompany).trim() !== '')
    );
  }
  if (club && club !== 'false') {
    students = students.filter((s) => s.club && String(s.club).trim() !== '');
  }
  if (studentCouncil && studentCouncil !== 'false') {
    students = students.filter((s) => s.studentCouncil && String(s.studentCouncil).trim() !== '');
  }

  students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const total = students.length;
  const paginatedStudents = students.slice(offset, offset + limit);

  const responseData = paginatedStudents.map((student) =>
    toCard(student)
  );

  return {
    data: responseData,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  };
}

async function getById(id) {
  return studentRepository.findById(id);
}

module.exports = { list, getById };
