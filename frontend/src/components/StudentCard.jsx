import React from 'react';
import Avatar from './Avatar';
import { parseTechTags, ensureHttps } from '../utils/helpers';
import {
  PinIcon,
  YouTubeIcon,
  GitHubIcon,
  BriefcaseIcon,
  RocketIcon,
  LinkedInIcon,
  ClubMembersIcon,
  StudentCouncilIcon
} from './icons';

export function CardSkeleton() {
  return (
    <div className="bg-secondary-1 rounded-3xl border border-black/[0.06] p-5 space-y-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-[30%] aspect-square rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-4/5" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-8 bg-gray-200 rounded-xl" />
        <div className="h-8 bg-gray-200 rounded-xl" />
      </div>
      <div className="h-px bg-gray-100" />
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded-full" />
          <div className="h-5 w-5 bg-gray-200 rounded-full" />
          <div className="h-5 w-5 bg-gray-200 rounded-full" />
        </div>
        <div className="h-6 w-6 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

function StudentCardComponent({ student, onOpen, onTagToggle, selectedTags = [] }) {
  const techs = parseTechTags(student.techStack, 3);
  const hasOpenSource = Boolean(student.openSource);
  const hasInternship = Boolean(student.internshipRole || student.internshipCompany);
  const hasStartup = Boolean(student.startupLink);

  return (
    <article
      onClick={onOpen}
      style={{
        backgroundColor: "#f9f6ea",
        willChange: 'transform',
        contentVisibility: 'auto',
        containIntrinsicSize: 'auto 300px',
        contain: 'layout style paint'
      }}
      className="rounded-3xl border border-black/[0.06] p-5 flex flex-col justify-between min-h-[280px] cursor-pointer group hover:border-primary-2/30 transition-colors duration-200 relative overflow-hidden shadow-sm"
    >
      {/* Decorative hover gradient top-border */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-1 via-primary-2 to-primary-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      {/* Top content - upper body wrapper with structured flex gaps */}
      <div className="flex flex-col gap-3.5 flex-1 justify-start min-w-0">

        {/* Header: avatar + name + metadata */}
        <div className="flex items-start justify-between gap-2 min-w-0 w-full pb-2">
          <div className="flex flex-col gap-2.5 min-w-0 flex-1 w-full">
            <div className="flex justify-center items-center gap-2">
              <Avatar
                student={student}
                className="w-[35%] h-[35%] aspect-square rounded-full flex-shrink-0"
              />
            </div>
            <div className="flex flex-col justify-center items-center">
              {/* Batch badge absolute positioned */}
              {student.classOf && (
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-white-300 text-[10px] font-medium tracking-wide shadow-sm">
                  {student.classOf.split(" ")[0]}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold text-center text-brand-black text-[16px] leading-tight truncate pb-1">
                  {student.name}
                </h2>

                <div className="flex flex-col flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 mt-1 text-gray-400 text-[11px] font-medium min-w-0">

                  <div className="pb-1">
                    {student.city && (
                      <span className="flex text-slate-500 items-center gap-0.5 truncate max-w-[100px]">
                        <PinIcon />
                        {student.city.toLowerCase().replace(/(^\w|\b\w)/g, char => char.toUpperCase())}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    {student.studentCouncil && (
                      <span
                        className="flex items-center gap-0.5 text-primary-3 font-semibold max-w-[250px] min-w-0"
                        title={student.studentCouncil}
                      >
                        <StudentCouncilIcon className="w-3 h-3 text-primary-3 shrink-0 mr-0.5" />
                        <span className="break-words">
                          {student.studentCouncil}
                        </span>
                      </span>
                    )}


                    {student.club && (
                      <span
                        className="flex items-center gap-0.5 text-primary-3 font-semibold max-w-[250px] min-w-0"
                        title={student.club}
                      >
                        <ClubMembersIcon className="w-3 h-3 text-primary-3 shrink-0 mr-0.5" />
                        <span className="break-words">
                          {student.club}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academics Grid - always rendered at exact same dimensions and symmetrical */}
        {/* <div className="grid grid-cols-2 gap-2 text-center h-[2.8rem]">
          {(class12 && Number.parseInt(class12) > 85) && <div className={class12 ? "bg-secondary-1/40 border border-primary-1/10 rounded-xl py-1.5 px-2" : "bg-gray-50/50 border border-gray-100 rounded-xl py-1.5 px-2"}>
            <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">Class XII</span>
            <span className={`text-[11px] font-extrabold ${class12 ? 'text-brand-black' : 'text-gray-300'}`}>
              {class12 ? `${class12}%` : 'N/A'}
            </span>
          </div>}
          {(jeeMains && Number.parseInt(jeeMains) > 85) && <div className={jeeMains ? "bg-secondary-1/40 border border-primary-1/10 rounded-xl py-1.5 px-2" : "bg-gray-50/50 border border-gray-100 rounded-xl py-1.5 px-2"}>
            <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">JEE Mains</span>
            <span className={`text-[11px] font-extrabold ${jeeMains ? 'text-brand-black' : 'text-gray-300'}`}>
              {jeeMains ? `${jeeMains}%ile` : 'N/A'}
            </span>
          </div>}
        </div> */}

        {/* Badges/Experience Status pills - fixed height with fallback spacer */}
        <div className="flex flex-wrap gap-1 h-5 overflow-hidden">
          {hasOpenSource && (
            <span
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-100/60 shadow-sm"
              title={student.orgName || 'Open Source Contributor'}
            >
              <GitHubIcon className="w-3 h-3 text-emerald-600 inline" />
              Open Source
            </span>
          )}
          {hasInternship && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 text-[9px] font-bold border border-sky-100/60 shadow-sm">
              <BriefcaseIcon className="w-3 h-3 text-sky-500 inline mr-0.5" />
              Internship
            </span>
          )}
          {hasStartup && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[9px] font-bold border border-amber-100/60 shadow-sm">
              <RocketIcon className="w-3 h-3 text-amber-500 inline mr-0.5" />
              Startup
            </span>
          )}
          {!hasOpenSource && !hasInternship && !hasStartup && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-amber-200 text-black text-[9px] font-medium border border-[#ffd732] shadow-sm">
              Independent Builder
            </span>
          )}
        </div>

        {/* Tech stack tags - fixed height with fallback */}
        <div className="flex flex-wrap gap-1 h-5 overflow-hidden">
          {techs.length > 0 ? (
            techs.map((t) => {
              const isActive = selectedTags.includes(t);
              return (
                <span
                  key={t}
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagToggle(t);
                  }}
                  className={`border border-[#d5e4f9] px-2 py-0.5 rounded-md text-[9px] font-bold transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-primary-2 text-white shadow-sm ring-1 ring-primary-3/30'
                    : 'bg-gray-100 text-black hover:bg-primary-1/20 hover:text-brand-black'
                    }`}
                >
                  {t}
                </span>
              );
            })
          ) : (
            <span className="text-[9px] font-semibold text-gray-300 italic px-2 py-0.5">
              No tags listed
            </span>
          )}
        </div>

      </div>

      {/* Footer Content */}
      <div className="mt-auto pt-2">
        {/* Divider */}
        <div className="h-px bg-gray-100 mb-3" />

        {/* Socials + Button */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2.5">
            {student.linkedin && (
              <a
                href={ensureHttps(student.linkedin)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[#0A66C2] hover:text-black transition-colors"
                title="LinkedIn"
              >
                <LinkedInIcon />
              </a>
            )}
            {student.github && (
              <a
                href={ensureHttps(student.github)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-brand-black hover:text-gray-400 transition-colors"
                title="GitHub"
              >
                <GitHubIcon />
              </a>
            )}

            {student?.youtube && (
              <a
                href={ensureHttps(student.youtube)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-[#FF0000] hover:text-brand-black transition-colors"
                title="YouTube"
              >
                <YouTubeIcon />
              </a>
            )}
          </div>

          {/* Premium capsule button for opening profile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-black text-white text-[10px] font-bold group-hover:bg-primary-1 group-hover:text-brand-black transition-colors duration-200 shadow-sm"
          >
            View Profile
            <span className="inline-block">&rarr;</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export const StudentCard = React.memo(StudentCardComponent);