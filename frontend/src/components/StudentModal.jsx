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
  YouTubeIcon,
  TrophyIcon,
  CodeIcon,
  RocketIcon,
  FileIcon,
  WrenchIcon,
  GlobeIcon,
  PlayIcon,
  InfoIcon,
  VideoIcon,
  BriefcaseIcon
} from './icons';

/* ─── Premium Modern Section Header ────────────────────────────────────── */
function SectionHeader({ icon, children }) {
  return (
    <div className="flex items-center gap-2.5 mb-4 mt-2 w-full min-w-0 font-sans">
      <span className="text-amber-400 opacity-95 shrink-0">{icon}</span>
      <h3 className="text-[11px] font-bold text-stone-800 uppercase tracking-wider truncate">{children}</h3>
      <div className="flex-1 h-[1px] bg-stone-200/60" />
    </div>
  );
}

function MapInternshipWithRole({ student }) {
  const internshipRoles = student.internshipRole.split(",").map(role => role.trim())
  const internshipCompanies = student.internshipCompany.split(",").map(company => company.trim())

  return Array.isArray(internshipRoles) && internshipRoles.map((role, index) => {
    return (
      <div key={index} className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">
            {role} at
            <span className="font-bold text-md text-stone-500"> {internshipCompanies[index]}</span>
          </h4>

        </div>
      </div>
    );
  });
}

export default function StudentModal({ student, onClose }) {
  const techs = parseTechTags(student.techStack);
  const photoUrl = driveToDirectImg(student.profilePicture, 1000);

  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [flipKey, setFlipKey] = useState(0);
  const [resumeLoaded, setResumeLoaded] = useState(false);

  // Re-trigger content transition animations smoothly on tab updates
  useEffect(() => {
    setFlipKey(prev => prev + 1);
  }, [activeTab]);

  // Handle global body scroll freeze and keyboard event handling cleanly
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const projectVideoEmbed =
    student.projectVideoSem2 && student.projectVideoSem2.includes('drive.google.com')
      ? driveToEmbed(student.projectVideoSem2)
      : getYouTubeEmbedUrl(student.projectVideoSem2);

  const resumeEmbedUrl = student.resume ? driveToEmbed(student.resume) : null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'projects', label: 'Projects' },
    // ...(student.resume ? [{ id: 'resume', label: 'Resume' }] : []),
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 lg:p-8 font-sans antialiased"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Immersive Dark Glass Backdrop Layer */}
      <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />

      {/* Main Structural Container Frame */}
      <div className="relative w-full max-w-4xl h-auto max-h-[92vh] lg:h-[82vh] bg-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] flex flex-col lg:flex-row z-10 border border-stone-200/80 overflow-y-auto lg:overflow-hidden min-w-0 transition-all duration-300">

        {/* Global Modal Exit Action Button */}
        <button
          onClick={onClose}
          aria-label="Close user profile view"
          className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-stone-900/30 hover:bg-stone-900/50 text-stone-100 hover:text-white flex items-center justify-center backdrop-blur-md transition-all duration-150 active:scale-95 shadow-sm"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>

        {/* ─── LEFT PROFILE PANEL: ORIGINAL LUXE DARK ANCHOR WITH MODERNIZE ASYMMETRY ─── */}
        <div className="relative w-full lg:w-[32%] shrink-0 bg-gradient-to-b from-[#211E1B] via-[#161513] to-[#121110] px-6 py-8 flex flex-col justify-between lg:overflow-y-auto border-b lg:border-b-0 lg:border-r border-stone-900 min-w-0">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col items-center text-center lg:text-left lg:items-start gap-5 w-full">

            {/* Profile Picture Box with Gold Gradient Ring Border Styling */}
            <div className="shrink-0 shadow-[0_12px_28px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden bg-stone-800 p-0.5 ring-1 ring-white/10 bg-gradient-to-b from-amber-400/30 to-transparent">
              <div className="relative w-[9rem] h-[11.5rem] sm:w-[10rem] sm:h-[13rem] lg:w-[11.5rem] lg:h-[14.5rem] rounded-[14px] overflow-hidden bg-stone-900 flex items-center justify-center">
                {photoUrl && !imgError ? (
                  <>
                    {!imgLoaded && (
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 w-full h-full bg-gradient-to-br from-stone-700 via-stone-600 to-stone-700 animate-pulse z-10 opacity-90 border border-stone-600/30 rounded-[14px]"
                      />
                    )}
                    <img
                      src={photoUrl}
                      alt={student.name}
                      onLoad={() => setImgLoaded(true)}
                      onError={() => setImgError(true)}
                      className={`w-full h-full object-cover transition-all duration-500 scale-100 hover:scale-102 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                  </>
                ) : (
                  <div className="w-full h-full text-amber-400 bg-stone-900 flex items-center justify-center font-bold text-2xl tracking-tight">
                    {getInitials(student.name)}
                  </div>
                )}
              </div>
            </div>

            {/* Typography Labels Node */}
            <div className="w-full min-w-0 space-y-3">
              <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start items-center">
                {student.classOf && (
                  <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-400 text-[10px] font-medium tracking-wide border border-stone-700/60 shadow-sm">
                    {student.classOf}
                  </span>
                )}
                {student.studentCouncil && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium border border-amber-500/20 flex items-center gap-1 max-w-full truncate">
                    <AwardIcon className="w-3 h-3 shrink-0" />
                    <span className="break-words">{student.studentCouncil}</span>
                  </span>
                )}
                {student.club && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-medium border border-amber-500/20 flex items-center gap-1 max-w-full truncate">
                    <AwardIcon className="w-3 h-3 shrink-0" />
                    <span className="break-words">{student.club}</span>
                  </span>
                )}
              </div>

              <div className="space-y-0.5">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight text-white break-words w-full">{student.name}</h2>
                <p className="text-stone-400 text-xs font-normal tracking-wide break-words w-full">
                  {student.school}{student.city ? ` · ${student.city}` : ''}
                </p>
              </div>

              {student.oneLiner && (
                <p className="text-stone-300/90 text-xs leading-relaxed border-l-2 border-amber-400/40 pl-3 mt-3.5 italic font-normal text-left max-w-sm mx-auto lg:mx-0">
                  "{student.oneLiner}"
                </p>
              )}

              {/* Action shortcuts */}
              <div className="flex gap-2 pt-1 justify-center lg:justify-start">
                {student.linkedin && (
                  <a href={ensureHttps(student.linkedin)} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white transition-colors duration-150" title="Connect over LinkedIn">
                    <LinkedInIcon className="w-3.5 h-3.5" />
                  </a>
                )}

                {student.github && (
                  <a href={ensureHttps(student.github)} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white transition-colors duration-150" title="Explore GitHub Repository">
                    <GitHubIcon className="w-3.5 h-3.5" />
                  </a>
                )}

                {student.youtube && (
                  <a href={ensureHttps(student.youtube)} target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-850 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-white transition-colors duration-150" title="Explore YouTube Channel">
                    <YouTubeIcon className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Academic Stats Track Row */}
          <div className="grid grid-cols-2 gap-2 mt-6 w-full text-left">
            {(student.class12 && Number.parseInt(student.class12) > 85) && (
              <div className="px-3 py-2 rounded-xl bg-stone-900/40 border border-stone-800/80 flex flex-col justify-center min-w-0 w-full">
                <p className="text-[9px] text-stone-500 uppercase tracking-wider font-bold truncate">Class XII</p>
                <p className="text-sm font-bold mt-0.5 text-stone-200 truncate">{student.class12}%</p>
              </div>
            )}
            {(student.jeeMains && Number.parseInt(student.jeeMains) > 85) && (
              <div className="px-3 py-2 rounded-xl bg-stone-900/40 border border-stone-800/80 flex flex-col justify-center min-w-0 w-full">
                <p className="text-[9px] text-stone-500 uppercase tracking-wider font-bold truncate">JEE %ile</p>
                <p className="text-sm font-bold mt-0.5 text-stone-200 truncate">{student.jeeMains}</p>
              </div>
            )}
            {student.internshipRole && (
              <div className="px-3 py-2 rounded-xl bg-emerald-950/20 border border-emerald-900/40 flex flex-col justify-center min-w-0 w-full col-span-2">
                <p className="text-[9px] text-emerald-500 uppercase tracking-wider font-bold truncate">Internship</p>
                <p className="text-xs font-bold mt-0.5 text-emerald-400 truncate">{student.internshipRole}</p>
              </div>
            )}
            {student.openSource && (
              <div className="px-3 py-2 rounded-xl bg-amber-950/20 border border-amber-900/40 flex flex-col justify-center min-w-0 w-full col-span-2">
                <p className="text-[9px] text-amber-500 uppercase tracking-wider font-bold flex items-center gap-1 break-words">
                  <CodeIcon className="w-2.5 h-2.5 shrink-0" /> Open Source
                </p>
                <p className="text-xs font-bold mt-0.5 text-amber-400 break-words">
                  {student.openSource}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT PANEL: CLEAN LIGHT TEXT CANVAS ─────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#FCFCFB] lg:overflow-hidden w-full">

          {/* Ledger Floating Nav Tab Bar */}
          <div className="h-[65px] flex border-b border-stone-200/80 shrink-0 px-4 sm:px-6 bg-stone-50/50 z-10 sticky top-0 lg:relative w-full overflow-x-auto scrollbar-none">
            <div className="flex min-w-max lg:min-w-0 gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-3.5 text-xs font-bold tracking-wider uppercase transition-all duration-150 ${activeTab === tab.id ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-amber-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Inner Content Leaf Canvas */}
          <div
            key={flipKey}
            className="flex-1 px-5 py-6 sm:p-6 bg-transparent overflow-y-auto w-full min-w-0 overflow-x-hidden animate-[fadeIn_0.2s_ease-out]"
          >
            {/* ─── TAB CONTENT: OVERVIEW ─── */}
            {activeTab === 'overview' && (
              (!student.aboutYou && !student.achievements && techs.length === 0 && !student.startupLink) ? (
                <div className="text-center py-16 px-4 bg-stone-50/30 rounded-2xl border border-stone-100/80 w-full max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
                  <div className="p-3 bg-stone-100 text-stone-400 rounded-full">
                    <InfoIcon className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-stone-800 font-bold text-sm tracking-wide">Profile in Progress</h3>
                    <p className="text-stone-400 text-xs leading-relaxed max-w-[240px]">
                      This builder hasn't added their overview details yet. Check back soon to see what they are working on!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 w-full min-w-0">
                  {student.aboutYou && (
                    <div className="w-full min-w-0">
                      <SectionHeader icon={<InfoIcon className="w-4 h-4" />}>About</SectionHeader>
                      <div className="text-stone-600 text-[13px] sm:text-[13.5px] leading-relaxed bg-stone-50/40 rounded-xl p-4 border border-stone-100 text-left w-full break-wordss whitespace-pre-line font-normal tracking-wide">
                        {renderTextWithLinks(student.aboutYou)}
                      </div>
                    </div>
                  )}

                  {(student?.internshipCompany || student?.internshipRole) && (
                    <div className="w-full min-w-0">
                      <SectionHeader icon={<BriefcaseIcon className="w-4 h-4" />}>Internship</SectionHeader>
                      <div className="relative text-stone-700 text-[13px] sm:text-[13.5px] leading-relaxed rounded-xl p-4 border border-amber-200/40 bg-amber-50/20 text-left w-full break-words whitespace-pre-line shadow-sm font-normal tracking-wide">
                        <MapInternshipWithRole student={student} />
                      </div>
                    </div>
                  )}


                  {student.achievements && (
                    <div className="w-full min-w-0">
                      <SectionHeader icon={<TrophyIcon className="w-4 h-4" />}>achievements</SectionHeader>
                      <div className="relative text-stone-700 text-[13px] sm:text-[13.5px] leading-relaxed rounded-xl p-4 border border-amber-200/40 bg-amber-50/20 text-left w-full break-words whitespace-pre-line shadow-sm font-normal tracking-wide">
                      {student?.achievements?.split("\n").length > 1 ? (
                      <ul className="list-disc space-y-2 pl-5">
                        {
                          student?.achievements?.split("\n").map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                          ))
                        }
                      </ul>) : (
                        <p>{student.achievements}</p>
                      )}
                      </div>
                    </div>
                  )}

                  {techs.length > 0 && (
                    <div className="w-full min-w-0">
                      <SectionHeader icon={<CodeIcon className="w-4 h-4" />}>Tech Stack</SectionHeader>
                      <div className="flex flex-wrap gap-1.5 pt-0.5 w-full">
                        {techs.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-md bg-stone-50 text-stone-700 text-[11px] font-medium border border-stone-200/60 cursor-default tracking-wide"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {student.startupLink && (
                    <div className="pt-2 flex w-full">
                      <a
                        href={ensureHttps(student.startupLink)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold shadow-sm hover:bg-stone-950 transition-all duration-150"
                      >
                        <RocketIcon className="w-3.5 h-3.5 text-amber-400" />Launch Startup Project
                      </a>
                    </div>
                  )}
                </div>
              )
            )}

            {/* ─── TAB CONTENT: ENGINEERING PROJECTS ─── */}
            {activeTab === 'projects' && (
              <div className="space-y-5 w-full min-w-0">
                {/* Semester 2 Block */}
                {student.projectTrackSem2 && (
                  <div className="relative rounded-xl bg-white p-5 border border-stone-200 shadow-sm text-left w-full min-w-0">
                    <div className="absolute top-0 left-0 w-full h-[2.5px] bg-amber-400" />

                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-amber-400 text-stone-950 text-[10px] font-bold uppercase tracking-wider shrink-0">
                        {student.year === 1 ? "Semester 2" : "Semester 4"}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60 truncate">
                        {student.projectTrackSem2}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 tracking-tight leading-snug break-words w-full">{student.projectTitleSem2}</h3>

                    {student.projectStackSem2 && (
                      <p className="text-xs text-stone-500 mt-2.5 flex items-center gap-1.5 font-normal w-full break-words">
                        <WrenchIcon className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="w-full text-stone-500 truncate">{student.projectStackSem2}</span>
                      </p>
                    )}

                    {/* Integrated Horizontal Action Button Row */}
                    <div className="flex flex-wrap gap-2 mt-4 w-full">
                      {student.projectLinkSem2 && (
                        <a href={ensureHttps(student.projectLinkSem2)} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors duration-150">
                          <GlobeIcon className="w-3 h-3 text-stone-500" />Live Link
                        </a>
                      )}
                      {student.projectVideoSem2 && (
                        <a href={ensureHttps(student.projectVideoSem2)} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-50/50 hover:bg-red-50 text-red-700 text-xs font-semibold border border-red-100 transition-colors duration-150">

                          <VideoIcon /> Watch Demo
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Semester 1 Block */}
                {student.projectTrackSem1 && (
                  <div className="relative rounded-xl bg-white p-5 border border-stone-200 shadow-sm text-left w-full min-w-0">
                    <div className="absolute top-0 left-0 w-full h-[2.5px] bg-stone-300" />

                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider border border-stone-200 shrink-0">
                        {student.year === 1 ? "Semester 1" : "Semester 3"}
                      </span>
                      <span className="text-[11px] text-stone-500 font-medium bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60 truncate">
                        {student.projectTrackSem1}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 tracking-tight leading-snug break-words w-full">{student.projectTitleSem1}</h3>

                    {student.projectStackSem1 && (
                      <p className="text-xs text-stone-500 mt-2.5 flex items-center gap-1.5 font-normal w-full break-words">
                        <WrenchIcon className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="w-full text-stone-500 truncate">{student.projectStackSem1}</span>
                      </p>
                    )}

                    {/* Integrated Horizontal Action Button Row */}
                    <div className="flex flex-wrap gap-2 mt-4 w-full">
                      {student.projectLinkSem1 && (
                        <a href={ensureHttps(student.projectLinkSem1)} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200 transition-colors duration-150">
                          <GlobeIcon className="w-3 h-3 text-stone-500" />Live Link
                        </a>
                      )}
                      {student.projectVideoSem1 && (
                        <a href={ensureHttps(student.projectVideoSem1)} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-50/50 hover:bg-red-50 text-red-700 text-xs font-semibold border border-red-100 transition-colors duration-150">
                          <VideoIcon /> Watch Demo
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Video Embed Showcase Frame Block */}
                {(student.projectVideoSem2 || student.projectVideoSem1) ? (
                  <div className="w-full min-w-0 hidden md:block pt-1">
                    <SectionHeader icon={<PlayIcon className="w-4 h-4" />}>Video Demonstration</SectionHeader>
                    <div className="w-full rounded-xl overflow-hidden bg-black shadow-md border border-stone-200 relative aspect-video max-w-full">
                      <iframe
                        src={projectVideoEmbed || (student.projectVideoSem1?.includes('drive.google.com') ? driveToEmbed(student.projectVideoSem1) : getYouTubeEmbedUrl(student.projectVideoSem1))}
                        title="Comprehensive project development visual timeline frame"
                        className="absolute inset-0 w-full h-full border-0 block m-0 p-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  !student.projectTitleSem1 && !student.projectTitleSem2 && (
                    <div className="text-center py-12 text-stone-400 w-full">
                      <InfoIcon className="w-7 h-7 mx-auto mb-2 opacity-30" />
                      <p className="font-medium text-xs tracking-wide uppercase">No Projects Indexed</p>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ─── TAB CONTENT: RESUME PREVIEW ─── */}
            {/* {activeTab === 'resume' && student.resume && (
              <div className="h-full flex flex-col space-y-4 w-full min-w-0">
                <SectionHeader icon={<FileIcon className="w-4 h-4" />}>Resume Document</SectionHeader>

                <div className="relative w-full h-[420px] lg:flex-1 lg:h-auto rounded-xl overflow-hidden bg-stone-50 border border-stone-200 shadow-inner">
                  {!resumeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-2">
                      <div className="w-5 h-5 border-2 border-stone-300 border-t-amber-500 rounded-full animate-spin" />
                    </div>
                  )}

                  <iframe
                    src={resumeEmbedUrl}
                    title={`${student.name}'s Academic Resume Port`}
                    className={`w-full h-full transition-opacity duration-300 ${resumeLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setResumeLoaded(true)}
                    allow="autoplay"
                    style={{ border: 'none' }}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2 items-center justify-between pt-0.5 w-full">
                  <a
                    href={ensureHttps(student.resume)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-[11px] font-medium border border-stone-200 shadow-sm transition-colors duration-150"
                  >
                    <FileIcon className="w-3 h-3 text-amber-500" />Open Canvas Direct
                  </a>
                </div>
              </div>
            )} */}
          </div>
        </div>

      </div>
    </div>
  );
}