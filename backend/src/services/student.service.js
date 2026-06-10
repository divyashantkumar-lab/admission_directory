const studentRepository = require('../repositories/student.repository');

function toCard(student) {
  return {
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
    achievement: student.achievement,
    startupLink: student.startupLink,
    photo: student.photo,
    clubOrCouncil: student.clubOrCouncil,
    classOf: student.classOf,
    city: student.city,
    // project video (top-level drive/yt link)
    projectVideo: student.projectVideo,
    resume: student.resume,
    internships: student.internships,
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
  };
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

async function list({ batch, search } = {}) {
  let students = await studentRepository.readAll();
  if (batch) {
    students = students.filter(
      (s) => String(s.batch || '').toLowerCase() === batch.toLowerCase()
    );
  }
  if (search) {
    students = students.filter((s) => matchesSearch(s, search));
  }
  students.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const responseData = students.map(toCard);

  return responseData;
}

async function getById(id) {
  return studentRepository.findById(id);
}

module.exports = { list, getById };
