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

export default function StudentModal({ student, onClose }) {
  const techs = parseTechTags(student.techStack);
  const photoUrl = driveToDirectImg(student.photo, 1000);
  const [imgError, setImgError] = useState(false);
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
    student.projectVideo && student.projectVideo.includes('drive.google.com')
      ? driveToEmbed(student.projectVideo)
      : getYouTubeEmbedUrl(student.projectVideo);

  const tabs = ['overview', 'projects'];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col z-10 animate-fade-up">

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all animate-fade-in"
        >
          <CloseIcon className="w-5 h-5" />
        </button>

        {/* Hero banner */}
        <div className="relative hero-mesh px-8 pt-10 pb-8 text-white shrink-0">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Profile image */}
            <div className="shrink-0">
              {photoUrl && !imgError ? (
                <img
                  src={photoUrl}
                  alt={student.name}
                  onError={() => setImgError(true)}
                  className="w-28 h-28 rounded-2xl object-cover ring-4 ring-primary-1/50 shadow-glow"
                />
              ) : (
                <div className="w-[6rem] h-[7rem] rounded-2xl bg-gradient-to-br from-primary-1 to-primary-2 text-brand-black flex items-center justify-center font-extrabold text-4xl ring-4 ring-primary-1/50 shadow-glow">
                  {getInitials(student.name)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-2">
                {student.batch && (
                  <span className="px-3 py-0.5 rounded-full bg-white/15 text-primary-1 text-xs font-bold border border-primary-1/30">
                    {student.batch}
                  </span>
                )}
                {student.classOf && (
                  <span className="px-3 py-0.5 rounded-full bg-white/10 text-white/70 text-xs border border-white/20">
                    {student.classOf}
                  </span>
                )}
                {student.clubOrCouncil && (
                  <span className="px-3 py-0.5 rounded-full bg-white/10 text-white/70 text-xs border border-white/20">
                    <AwardIcon />{student.clubOrCouncil}
                  </span>
                )}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{student.name}</h2>
              <p className="text-white/60 mt-1 text-sm">{student.school}{student.city ? ` · ${student.city}` : ''}</p>
              {student.oneLiner && (
                <p className="text-white/80 mt-3 italic text-sm leading-relaxed border-l-2 border-primary-1 pl-3">
                  "{student.oneLiner}"
                </p>
              )}
              {/* Social icons */}
              <div className="flex gap-3 mt-4 justify-center sm:justify-start">
                {student.linkedin && (
                  <a href={ensureHttps(student.linkedin)} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-primary-1 transition-colors" title="LinkedIn">
                    <LinkedInIcon />
                  </a>
                )}
                {student.github && (
                  <a href={ensureHttps(student.github)} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-primary-1 transition-colors" title="GitHub">
                    <GitHubIcon />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-3 mt-6">
            {student.class12 && (
              <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur text-center border border-white/20">
                <p className="text-xs text-white/50 uppercase tracking-wide">Class XII</p>
                <p className="text-lg font-extrabold text-primary-1">{student.class12}%</p>
              </div>
            )}
            {student.jeeMains && (
              <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur text-center border border-white/20">
                <p className="text-xs text-white/50 uppercase tracking-wide">JEE %ile</p>
                <p className="text-lg font-extrabold text-primary-1">{student.jeeMains}</p>
              </div>
            )}
            {student.internships && (
              <div className="px-4 py-2 rounded-xl bg-emerald-500/20 backdrop-blur text-center border border-emerald-400/30">
                <p className="text-xs text-emerald-300 uppercase tracking-wide">Internship</p>
                <p className="text-sm font-bold text-emerald-200 truncate max-w-[120px]">✓</p>
              </div>
            )}
            {student.openSource && (
              <div className="px-4 py-2 rounded-xl bg-sky-500/20 backdrop-blur text-center border border-sky-400/30">
                <p className="text-xs text-sky-300 uppercase tracking-wide">Open Source</p>
                <p className="text-sm font-bold text-sky-200">{student.openSource}{student.orgName ? ` · ${student.orgName}` : ''}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0 px-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`capitalize px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === tab
                ? 'border-primary-2 text-brand-black'
                : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="overflow-y-auto flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* About */}
              {student.aboutYou && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
                  <div className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-xl p-4 whitespace-pre-line">{renderTextWithLinks(student.aboutYou)}</div>
                </div>
              )}

              {/* Achievement */}
              {student.achievement && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center"><TrophyIcon />Achievements</h3>
                  <div className="text-gray-700 text-sm leading-relaxed bg-amber-50 border border-amber-100 rounded-xl p-4 whitespace-pre-line">{renderTextWithLinks(student.achievement)}</div>
                </div>
              )}

              {/* Tech Stack */}
              {techs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center"><CodeIcon />Tech Stack</h3>
                  <div className="flex flex-wrap gap-2">
                    {techs.map((t) => (
                      <span key={t} className="px-3 py-1 rounded-lg bg-brand-black text-primary-1 text-xs font-bold">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Internships */}
              {student.internships && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center"><BriefcaseIcon />Internships</h3>
                  <div className="text-gray-700 text-sm bg-emerald-50 border border-emerald-100 rounded-xl p-4 whitespace-pre-line">{renderTextWithLinks(student.internships)}</div>
                </div>
              )}

              {/* Links row */}
              <div className="flex flex-wrap gap-3">
                {student.startupLink && (
                  <a href={ensureHttps(student.startupLink)} target="_blank" rel="noopener noreferrer" className="btn-primary !py-2 !px-4 !text-xs">
                    <RocketIcon />Startup
                  </a>
                )}
                {student.resume && (
                  <a href={ensureHttps(student.resume)} target="_blank" rel="noopener noreferrer" className="btn-dark !py-2 !px-4 !text-xs">
                    <FileIcon />Resume
                  </a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              {/* Sem 2 project */}
              {student.projectTitleSem2 && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded bg-primary-2 text-white text-xs font-extrabold uppercase">Sem 2</span>
                    {student.projectTrackSem2 && (
                      <span className="text-xs text-gray-400 font-semibold">{student.projectTrackSem2}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold text-brand-black">{student.projectTitleSem2}</h3>
                  {student.projectStackSem2 && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center"><WrenchIcon />{student.projectStackSem2}</p>
                  )}
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {student.projectLinkSem2 && (
                      <a href={ensureHttps(student.projectLinkSem2)} target="_blank" rel="noopener noreferrer" className="btn-dark !py-1.5 !px-3 !text-xs">
                        <GlobeIcon />Live Demo
                      </a>
                    )}
                    {student.projectVideoSem2 && (
                      <a href={ensureHttps(student.projectVideoSem2)} target="_blank" rel="noopener noreferrer" className="btn-primary !py-1.5 !px-3 !text-xs">
                        <VideoIcon />Video
                      </a>
                    )}
                  </div>
                </div>
              )}


              {/* Sem 1 project */}
              {student.projectTitleSem1 && (
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-0.5 rounded bg-brand-black text-primary-1 text-xs font-extrabold uppercase">Sem 1</span>
                    {student.projectTrackSem1 && (
                      <span className="text-xs text-gray-400 font-semibold">{student.projectTrackSem1}</span>
                    )}
                  </div>
                  <h3 className="text-lg font-extrabold text-brand-black">{student.projectTitleSem1}</h3>
                  {student.projectStackSem1 && (
                    <p className="text-sm text-gray-500 mt-2 flex items-center"><WrenchIcon />{student.projectStackSem1}</p>
                  )}
                  <div className="flex gap-3 mt-3 flex-wrap">
                    {student.projectLinkSem1 && (
                      <a href={ensureHttps(student.projectLinkSem1)} target="_blank" rel="noopener noreferrer" className="btn-dark !py-1.5 !px-3 !text-xs">
                        <GlobeIcon />Live Demo
                      </a>
                    )}
                    {student.projectVideoSem1 && (
                      <a href={ensureHttps(student.projectVideoSem1)} target="_blank" rel="noopener noreferrer" className="btn-primary !py-1.5 !px-3 !text-xs">
                        <VideoIcon />Video
                      </a>
                    )}
                  </div>
                </div>
              )}



              {/* Embedded project video */}
              {(projectVideoEmbed || student.projectVideoSem1) && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center"><VideoIcon />Project Video</h3>
                  <div className="rounded-2xl overflow-hidden aspect-video bg-black">
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
              )}

              {!student.projectTitleSem1 && !student.projectTitleSem2 && !projectVideoEmbed && (
                <div className="text-center py-12 text-gray-400">
                  <InfoIcon />
                  <p className="font-semibold text-sm">No project info available yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
