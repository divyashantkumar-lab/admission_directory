import React, { useState, useEffect } from 'react';
import {
  parseTechTags,
  driveToDirectImg,
  driveToEmbed,
  getYouTubeEmbedUrl,
  getInitials,
  renderTextWithLinks,
  ensureHttps
} from '../utils/helpers';
import {
  CloseIcon,
  AwardIcon,
  LinkedInIcon,
  GitHubIcon,
  TrophyIcon,
  CodeIcon,
  BriefcaseIcon,
  RocketIcon,
  FileIcon,
  WrenchIcon,
  VideoIcon,
  GlobeIcon,
  CameraIcon,
  PlayIcon,
  InfoIcon,
  ImageIcon
} from './icons';

/* ─── tiny section header ────────────────────────────────────────── */
function SectionHeader({ icon, children }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-primary-2">{icon}</span>
      <h3 className="text-[11px] font-extrabold text-gray-400 uppercase tracking-[0.12em]">{children}</h3>
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
    </div>
  );
}

/* ─── glassmorphism stat pill (used in hero) ─────────────────────── */
function StatPill({ label, value, accent = 'primary' }) {
  const accents = {
    primary: 'text-primary-1 border-primary-1/25',
    emerald: 'text-emerald-300 border-emerald-400/25',
    sky: 'text-sky-300 border-sky-400/25',
  };
  return (
    <div className={`px-4 py-2.5 rounded-2xl bg-white/[0.07] backdrop-blur-md border ${accents[accent]} text-center min-w-[80px] hover:bg-white/[0.12] transition-colors duration-200`}>
      <p className="text-[10px] text-white/45 uppercase tracking-wider font-bold leading-tight">{label}</p>
      <p className={`text-base font-extrabold ${accents[accent].split(' ')[0]} mt-0.5 leading-tight`}>{value}</p>
    </div>
  );
}

export default function StudentModal({ student, onClose }) {
  const techs = parseTechTags(student.techStack);
  const photoUrl = driveToDirectImg(student.photo, 1000);
  const [imgError, setImgError]   = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const ytEmbed = getYouTubeEmbedUrl(student.youtube);
  const projectVideoEmbed =
    student.projectVideoSem2 && student.projectVideoSem2.includes('drive.google.com')
      ? driveToEmbed(student.projectVideoSem2)
      : getYouTubeEmbedUrl(student.projectVideoSem2);

  const resumeEmbedUrl = student.resume ? driveToEmbed(student.resume) : null;
  const [resumeLoaded, setResumeLoaded] = useState(false);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    ...(student.resume ? [{ id: 'resume', label: 'Resume' }] : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col z-10 animate-fade-up ring-1 ring-black/[0.04]">

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 z-20 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white transition-all duration-200 border border-white/10"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* ─── HERO BANNER ──────────────────────────────────────────── */}
        <div className="relative hero-mesh px-8 pt-12 pb-10 text-white shrink-0 overflow-hidden">
          {/* Decorative orbs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary-1/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary-2/8 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-7">
            {/* Profile image */}
            <div className="shrink-0">
              {photoUrl && !imgError ? (
                <div className="relative w-[7.5rem] h-[7.5rem]">
                  {!imgLoaded && (
                    <div aria-hidden="true" className="absolute inset-0 w-full h-full rounded-3xl skeleton-dark" />
                  )}
                  <img
                    src={photoUrl}
                    alt={student.name}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => setImgError(true)}
                    className={`w-full h-full rounded-3xl object-cover ring-[3px] ring-primary-1/40 shadow-lg shadow-primary-1/20 transition-opacity duration-500 ${
                      imgLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </div>
              ) : (
                <div className="w-[7.5rem] h-[7.5rem] rounded-3xl bg-gradient-to-br from-primary-1 to-primary-2 text-brand-black flex items-center justify-center font-extrabold text-5xl ring-[3px] ring-primary-1/40 shadow-lg shadow-primary-1/20">
                  {getInitials(student.name)}
                </div>
              )}
            </div>

            {/* Identity block */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-3">
                {student.classOf && (
                  <span className="px-3 py-1 rounded-full bg-white/[0.08] text-white/60 text-[11px] font-bold border border-white/[0.08] backdrop-blur-sm">
                    Class of {student.classOf}
                  </span>
                )}
                {student.clubOrCouncil && (
                  <span className="px-3 py-1 rounded-full bg-primary-1/[0.12] text-primary-1 text-[11px] font-bold border border-primary-1/20 backdrop-blur-sm flex items-center gap-1">
                    <AwardIcon />{student.clubOrCouncil}
                  </span>
                )}
              </div>

              <h2 className="text-3xl sm:text-[2.2rem] font-extrabold tracking-tight leading-tight">{student.name}</h2>

              <p className="text-white/50 mt-1.5 text-sm font-medium">
                {student.school}{student.city ? ` · ${student.city}` : ''}
              </p>

              {student.oneLiner && (
                <p className="text-white/70 mt-4 text-sm leading-relaxed border-l-2 border-primary-1/60 pl-4 italic max-w-lg">
                  "{student.oneLiner}"
                </p>
              )}

              {/* Social icons */}
              <div className="flex gap-2.5 mt-5 justify-center sm:justify-start">
                {student.linkedin && (
                  <a href={ensureHttps(student.linkedin)} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/[0.08] hover:bg-[#0A66C2]/30 border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-[#0A66C2] transition-all duration-200" title="LinkedIn">
                    <LinkedInIcon />
                  </a>
                )}
                {student.github && (
                  <a href={ensureHttps(student.github)} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/[0.08] hover:bg-white/20 border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white transition-all duration-200" title="GitHub">
                    <GitHubIcon />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stat pills row */}
          <div className="flex flex-wrap gap-2.5 mt-8">
            {student.class12 && <StatPill label="Class XII" value={`${student.class12}%`} />}
            {student.jeeMains && <StatPill label="JEE %ile" value={student.jeeMains} />}
            {student.internships && <StatPill label="Internship" value="✓" accent="emerald" />}
            {student.openSource && (
              <StatPill
                label="Open Source"
                value={student.orgName || student.openSource}
                accent="sky"
              />
            )}
          </div>
        </div>

        {/* ─── TABS ─────────────────────────────────────────────────── */}
        <div className="flex border-b border-gray-100 shrink-0 px-8 bg-white">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-5 py-3.5 text-sm font-bold transition-colors duration-200 ${activeTab === tab.id
                ? 'text-brand-black'
                : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
              {/* Active indicator bar */}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-2 right-2 h-[3px] rounded-full bg-gradient-to-r from-primary-1 to-primary-2" />
              )}
            </button>
          ))}
        </div>

        {/* ─── TAB CONTENT ──────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 px-8 py-7 bg-gradient-to-b from-white to-gray-50/80">
          {activeTab === 'overview' && (
            <div className="space-y-7">

              {/* About */}
              {student.aboutYou && (
                <div>
                  <SectionHeader icon={<InfoIcon />}>About</SectionHeader>
                  <div className="text-gray-600 text-[13.5px] leading-[1.75] bg-white rounded-2xl p-5 shadow-sm border border-gray-100/80 whitespace-pre-line">
                    {renderTextWithLinks(student.aboutYou)}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {student.achievement && (
                <div>
                  <SectionHeader icon={<TrophyIcon />}>Achievements</SectionHeader>
                  <div className="relative text-gray-700 text-[13.5px] leading-[1.75] rounded-2xl p-5 shadow-sm border border-amber-100/80 whitespace-pre-line overflow-hidden bg-gradient-to-br from-amber-50/80 to-orange-50/40">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-1 to-primary-2 rounded-full" />
                    <div className="pl-3">
                      {renderTextWithLinks(student.achievement)}
                    </div>
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {techs.length > 0 && (
                <div>
                  <SectionHeader icon={<CodeIcon />}>Tech Stack</SectionHeader>
                  <div className="flex flex-wrap gap-2">
                    {techs.map((t) => (
                      <span
                        key={t}
                        className="px-3.5 py-1.5 rounded-xl bg-brand-black text-primary-1 text-[11px] font-bold border border-brand-muted/50 hover:bg-brand-charcoal hover:-translate-y-0.5 transition-all duration-200 cursor-default shadow-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships */}
              {student.internships && (
                <div>
                  <SectionHeader icon={<BriefcaseIcon />}>Internships</SectionHeader>
                  <div className="relative text-gray-700 text-[13.5px] leading-[1.75] rounded-2xl p-5 shadow-sm border border-emerald-100/80 whitespace-pre-line overflow-hidden bg-gradient-to-br from-emerald-50/60 to-teal-50/30">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-emerald-400 to-teal-400 rounded-full" />
                    <div className="pl-3">
                      {renderTextWithLinks(student.internships)}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick-action links */}
              <div className="flex flex-wrap gap-3 pt-1">
                {student.startupLink && (
                  <a
                    href={ensureHttps(student.startupLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-1 to-primary-2 text-brand-black text-xs font-extrabold shadow-md hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <RocketIcon />Startup
                  </a>
                )}
                {student.resume && (
                  <a
                    href={ensureHttps(student.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-black text-white text-xs font-extrabold border border-brand-muted hover:bg-brand-charcoal hover:border-primary-1/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm"
                  >
                    <FileIcon />Resume
                  </a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'resume' && student.resume && (
            <div className="space-y-4">
              <SectionHeader icon={<FileIcon />}>Resume Preview</SectionHeader>

              <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm" style={{ height: '70vh' }}>
                {/* Shimmer skeleton while iframe loads */}
                {!resumeLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50">
                    <div className="w-full h-full p-6 space-y-4">
                      <div className="skeleton h-6 w-2/3 rounded-lg" />
                      <div className="skeleton h-4 w-full rounded" />
                      <div className="skeleton h-4 w-full rounded" />
                      <div className="skeleton h-4 w-5/6 rounded" />
                      <div className="skeleton h-4 w-full rounded" />
                      <div className="skeleton h-4 w-3/4 rounded" />
                      <div className="skeleton h-32 w-full rounded-xl mt-4" />
                      <div className="skeleton h-4 w-full rounded" />
                      <div className="skeleton h-4 w-4/5 rounded" />
                      <div className="skeleton h-4 w-full rounded" />
                    </div>
                  </div>
                )}

                <iframe
                  src={resumeEmbedUrl}
                  title={`${student.name}'s Resume`}
                  className={`w-full h-full transition-opacity duration-500 ${resumeLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setResumeLoaded(true)}
                  allow="autoplay"
                  style={{ border: 'none' }}
                />
              </div>

              {/* Fallback open-in-new-tab link */}
              <div className="flex items-center justify-between pt-1">
                <p className="text-xs text-gray-400">Can't see the preview?</p>
                <a
                  href={ensureHttps(student.resume)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-black text-white text-[11px] font-bold hover:bg-brand-charcoal transition-colors duration-200 shadow-sm"
                >
                  <FileIcon />Open in New Tab
                </a>
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">

              {/* Sem 2 project */}
              {student.projectTitleSem2 && (
                <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-gray-100/80 overflow-hidden group">
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-1 via-primary-2 to-primary-3" />

                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-primary-1 to-primary-2 text-brand-black text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      Semester 2
                    </span>
                    {student.projectTrackSem2 && (
                      <span className="text-[11px] text-gray-400 font-semibold bg-gray-100 px-2.5 py-0.5 rounded-lg">
                        {student.projectTrackSem2}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-brand-black leading-snug">{student.projectTitleSem2}</h3>

                  {student.projectStackSem2 && (
                    <p className="text-[12.5px] text-gray-500 mt-2.5 flex items-center gap-1.5 font-medium">
                      <WrenchIcon /> {student.projectStackSem2}
                    </p>
                  )}

                  <div className="flex gap-2.5 mt-5 flex-wrap">
                    {student.projectLinkSem2 && (
                      <a href={ensureHttps(student.projectLinkSem2)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-black text-white text-[11px] font-bold hover:bg-brand-charcoal transition-colors duration-200 shadow-sm">
                        <GlobeIcon />Live Demo
                      </a>
                    )}
                    {student.projectVideoSem2 && (
                      <a href={ensureHttps(student.projectVideoSem2)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-1 text-brand-black text-[11px] font-bold hover:bg-primary-2 transition-colors duration-200 shadow-sm">
                        <VideoIcon />Video
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Sem 1 project */}
              {student.projectTitleSem1 && (
                <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-gray-100/80 overflow-hidden group">
                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand-black via-brand-charcoal to-brand-muted" />

                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-xl bg-brand-black text-primary-1 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                      Semester 1
                    </span>
                    {student.projectTrackSem1 && (
                      <span className="text-[11px] text-gray-400 font-semibold bg-gray-100 px-2.5 py-0.5 rounded-lg">
                        {student.projectTrackSem1}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-brand-black leading-snug">{student.projectTitleSem1}</h3>

                  {student.projectStackSem1 && (
                    <p className="text-[12.5px] text-gray-500 mt-2.5 flex items-center gap-1.5 font-medium">
                      <WrenchIcon /> {student.projectStackSem1}
                    </p>
                  )}

                  <div className="flex gap-2.5 mt-5 flex-wrap">
                    {student.projectLinkSem1 && (
                      <a href={ensureHttps(student.projectLinkSem1)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-black text-white text-[11px] font-bold hover:bg-brand-charcoal transition-colors duration-200 shadow-sm">
                        <GlobeIcon />Live Demo
                      </a>
                    )}
                    {student.projectVideoSem1 && (
                      <a href={ensureHttps(student.projectVideoSem1)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary-1 text-brand-black text-[11px] font-bold hover:bg-primary-2 transition-colors duration-200 shadow-sm">
                        <VideoIcon />Video
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Embedded project video */}
              {student.projectVideoSem2
                ? (
                  <div>
                    <SectionHeader icon={<PlayIcon />}>Project Demo</SectionHeader>
                    <div className="rounded-2xl overflow-hidden aspect-video bg-brand-black shadow-lg ring-1 ring-black/10">
                      <iframe
                        src={projectVideoEmbed ||
                          (student.projectVideoSem2?.includes('drive.google.com')
                            ? driveToEmbed(student.projectVideoSem2)
                            : getYouTubeEmbedUrl(student.projectVideoSem2))}
                        title="Project demo"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )
                : (
                  student.projectVideoSem1
                    ? (
                      <div>
                        <SectionHeader icon={<PlayIcon />}>Project Demo</SectionHeader>
                        <div className="rounded-2xl overflow-hidden aspect-video bg-brand-black shadow-lg ring-1 ring-black/10">
                          <iframe
                            src={projectVideoEmbed ||
                              (student.projectVideoSem1?.includes('drive.google.com')
                                ? driveToEmbed(student.projectVideoSem1)
                                : getYouTubeEmbedUrl(student.projectVideoSem1))}
                            title="Project demo"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    )
                    : !student.projectTitleSem1 && !student.projectTitleSem2 && (
                      <div className="text-center py-16 text-gray-400">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                          <InfoIcon />
                        </div>
                        <p className="font-bold text-sm text-gray-500">No project info available yet</p>
                        <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
                      </div>
                    )
                )
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
