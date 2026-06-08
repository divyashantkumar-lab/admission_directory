import { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SEOMeta from '../components/SEOMeta';
import { fetchStudents } from '../store/studentSlice';

function getInitials(name) {
  return (name || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function parseTechTags(techStack, limit) {
  if (!techStack) return [];
  const tags = techStack
    .split(/[\n|]/)
    .map((t) => t.split(':')[0].trim().replace(/-\d+$/, ''))
    .filter((t) => t && t !== '#REF!' && !t.startsWith('#'));
  return limit ? tags.slice(0, limit) : tags;
}

// Helper to merge default classes with custom className overrides, preventing conflicting width/height styles in Tailwind
function mergeClasses(defaultClasses, passedClasses = '') {
  const defaults = defaultClasses.split(' ').filter(Boolean);
  const passed = passedClasses.split(' ').filter(Boolean);

  const hasWidth = passed.some((c) => c.startsWith('w-') || c.startsWith('max-w-') || c.startsWith('min-w-'));
  const hasHeight = passed.some((c) => c.startsWith('h-') || c.startsWith('max-h-') || c.startsWith('min-h-'));

  const filteredDefaults = defaults.filter((c) => {
    if ((c.startsWith('w-') || c.startsWith('max-w-') || c.startsWith('min-w-')) && hasWidth) return false;
    if ((c.startsWith('h-') || c.startsWith('max-h-') || c.startsWith('min-h-')) && hasHeight) return false;
    return true;
  });

  return [...filteredDefaults, ...passed].join(' ');
}

function renderTextWithLinks(text) {
  if (!text) return null;
  const trimmed = text.trim();
  // If the entire text is a single URL, render a premium link badge/button
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return (
      <a
        href={trimmed}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-black text-white hover:bg-primary-1 hover:text-brand-black text-xs font-bold transition-all duration-300 shadow-sm"
      >
        <AttachmentIcon />Open Linked Document
      </a>
    );
  }

  // Otherwise, split the text by URL and render matches as inline links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-3 hover:text-primary-2 underline break-all font-semibold inline-flex items-center gap-0.5"
        >
          <AttachmentIcon />Link
        </a>
      );
    }
    return part;
  });
}

// Convert Google Drive share links to direct embeddable URLs
function driveToEmbed(url) {
  if (!url) return null;
  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
  const openMatch = url.match(/[?&]id=([^&]+)/);
  if (openMatch) return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
  return url;
}

function driveToDirectImg(url, width = 600) {
  if (!url) return null;
  const fileMatch = url.match(/\/file\/d\/([^/&?#]+)/);
  if (fileMatch) return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w${width}`;
  const openMatch = url.match(/[?&]id=([^&?#]+)/);
  if (openMatch) return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w${width}`;
  return url;
}

function isVideoLink(url) {
  if (!url) return false;
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('drive.google.com')
  );
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const match = url.match(/(?:v=|\/shorts\/|youtu\.be\/)([^&?/]+)/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

// ── Social icon SVGs ──────────────────────────────────────────────────────────
const LinkedInIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={mergeClasses("w-4 h-4", className)}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={mergeClasses("w-4 h-4", className)}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const XIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={mergeClasses("w-4 h-4", className)}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const YouTubeIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={mergeClasses("w-4 h-4", className)}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const InstagramIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={mergeClasses("w-4 h-4", className)}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const SearchIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-5 h-5", className)}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const CloseIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4", className)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const FilterIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-5 h-5", className)}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const PinIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4", className)}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const AwardIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline mr-1 text-primary-2", className)}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const TrophyIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 text-amber-500 inline mr-1.5", className)}>
    <path d="M6 9H4.5a2.5 2.5 0 010-5H6M18 9h1.5a2.5 2.5 0 000-5H18M4 22h16M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34M12 2a5 5 0 00-5 5v3c0 2.76 2.24 5 5 5s5-2.24 5-5V7a5 5 0 00-5-5z" />
  </svg>
);

const CodeIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 text-primary-2 inline mr-1.5", className)}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const BriefcaseIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 text-sky-500 inline mr-1.5", className)}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
  </svg>
);

const RocketIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline mr-1", className)}>
    <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5M12 2C7 2 4 5 4 9c0 2 1 3 3 5l2 2 4 4 2 2c2 2 3 3 5 3 4 0 7-3 7-7 0-2-1-3-3-5l-2-2-4-4-2-2zM9 15l6-6" />
  </svg>
);

const FileIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline mr-1", className)}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 00-2 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const WrenchIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline mr-1 text-gray-400", className)}>
    <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" />
  </svg>
);

const VideoIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline mr-1", className)}>
    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
    <line x1="7" y1="2" x2="7" y2="22" />
    <line x1="17" y1="2" x2="17" y2="22" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <line x1="2" y1="7" x2="7" y2="7" />
    <line x1="2" y1="17" x2="7" y2="17" />
  </svg>
);

const GlobeIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline mr-1", className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
  </svg>
);

const CameraIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 text-gray-400 inline mr-1.5", className)}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const PlayIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 text-red-500 inline mr-1.5", className)}>
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const BookIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 text-gray-400 inline mr-1.5 align-middle", className)}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const CohortIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 text-gray-400 inline mr-1.5 align-middle", className)}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5-10 5zM6 12.5V18l6 3 6-3v-5.5" />
  </svg>
);

const TargetIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 text-gray-400 inline mr-1.5 align-middle", className)}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const InfoIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-8 h-8 mx-auto text-gray-400 mb-2", className)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const ImageIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-8 h-8 mx-auto text-gray-400 mb-2", className)}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const EmptySearchIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-12 h-12 mx-auto text-gray-300 mb-4", className)}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const AttachmentIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={mergeClasses("w-4 h-4 inline mr-1", className)}>
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

// ── Avatar Component ───────────────────────────────────────────────────────────
function Avatar({ student, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    sm: 'w-12 h-12 text-base',
    md: 'w-14 h-14 text-lg',
    lg: 'w-32 h-32 text-4xl',
  };
  const photoUrl = driveToDirectImg(student.photo);

  if (photoUrl && !imgError) {
    return (
      <>
        <img
          src={photoUrl}
          alt={student.name}
          onError={() => setImgError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover ring-4 ring-primary-1/30 shadow-lg group-hover:scale-105 group-hover:ring-primary-2/40 transition-all duration-300`}
        />
      </>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-1 to-primary-2 text-brand-black flex items-center justify-center font-extrabold ring-4 ring-primary-1/30 shadow-lg group-hover:scale-105 group-hover:ring-primary-2/40 transition-all duration-300`}
    >
      {getInitials(student.name)}
    </div>
  );
}

// ── Student Profile Modal ─────────────────────────────────────────────────────
function StudentModal({ student, onClose }) {
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
                  <a href={student.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-primary-1 transition-colors" title="LinkedIn">
                    <LinkedInIcon />
                  </a>
                )}
                {student.github && (
                  <a href={student.github} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-primary-1 transition-colors" title="GitHub">
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
                  <a href={student.startupLink} target="_blank" rel="noopener noreferrer" className="btn-primary !py-2 !px-4 !text-xs">
                    <RocketIcon />Startup
                  </a>
                )}
                {student.resume && (
                  <a href={student.resume} target="_blank" rel="noopener noreferrer" className="btn-dark !py-2 !px-4 !text-xs">
                    <FileIcon />Resume
                  </a>
                )}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
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
                      <a href={student.projectLinkSem1} target="_blank" rel="noopener noreferrer" className="btn-dark !py-1.5 !px-3 !text-xs">
                        <GlobeIcon />Live Demo
                      </a>
                    )}
                    {student.projectVideoSem1 && (
                      <a href={student.projectVideoSem1} target="_blank" rel="noopener noreferrer" className="btn-primary !py-1.5 !px-3 !text-xs">
                        <VideoIcon />Video
                      </a>
                    )}
                  </div>
                </div>
              )}

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
                      <a href={student.projectLinkSem2} target="_blank" rel="noopener noreferrer" className="btn-dark !py-1.5 !px-3 !text-xs">
                        <GlobeIcon />Live Demo
                      </a>
                    )}
                    {student.projectVideoSem2 && (
                      <a href={student.projectVideoSem2} target="_blank" rel="noopener noreferrer" className="btn-primary !py-1.5 !px-3 !text-xs">
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

          {activeTab === 'media' && (
            <div className="space-y-6">
              {/* Profile photo large */}
              {photoUrl && !imgError && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center"><CameraIcon />Profile Photo</h3>
                  <img
                    src={photoUrl}
                    alt={student.name}
                    onError={() => setImgError(true)}
                    className="w-full max-h-80 object-contain rounded-2xl bg-gray-100"
                  />
                </div>
              )}

              {/* YouTube channel video */}
              {ytEmbed && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center"><PlayIcon />YouTube</h3>
                  <div className="rounded-2xl overflow-hidden aspect-video bg-black">
                    <iframe
                      src={ytEmbed}
                      title="YouTube"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {!photoUrl && !ytEmbed && (
                <div className="text-center py-12 text-gray-400">
                  <ImageIcon />
                  <p className="font-semibold text-sm">No media available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card Skeleton ─────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-black/[0.04] p-5 space-y-4 animate-pulse shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-4/5" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-8 bg-gray-100 rounded-xl" />
        <div className="h-8 bg-gray-100 rounded-xl" />
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

// ── Student Card ──────────────────────────────────────────────────────────────
function StudentCard({ student, onOpen, onTagToggle, selectedTags }) {
  const techs = parseTechTags(student.techStack, 3);
  const hasOpenSource = Boolean(student.openSource);
  const hasInternship = Boolean(student.internships);
  const hasStartup = Boolean(student.startupLink);

  const class12 = student.class12;
  const jeeMains = student.jeeMains;

  return (
    <article
      onClick={onOpen}
      className="bg-white rounded-3xl border border-black/[0.04] p-5 flex flex-col justify-between h-[280px] cursor-pointer group hover:border-primary-2/30 hover:shadow-glow hover:-translate-y-1.5 transition-all duration-300 ease-out relative overflow-hidden shadow-sm"
    >
      {/* Decorative hover gradient top-border */}
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary-1 via-primary-2 to-primary-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Top content - upper body wrapper with structured flex gaps */}
      <div className="flex flex-col gap-3.5 flex-1 justify-start min-w-0">

        {/* Header: avatar + name + metadata */}
        <div className="flex items-start justify-between gap-2 min-w-0 w-full">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Avatar student={student} size="sm" />
            <div className="min-w-0 flex-1">
              <h2 className="font-extrabold text-brand-black text-[15px] leading-tight group-hover:text-primary-3 transition-colors truncate">
                {student.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 mt-1 text-gray-400 text-[11px] font-medium min-w-0">
                {student.city && (
                  <span className="flex items-center gap-0.5 truncate max-w-[100px]">
                    <PinIcon />
                    {student.city}
                  </span>
                )}
                {student.city && student.clubOrCouncil && <span className="text-gray-300">•</span>}
                {student.clubOrCouncil && (
                  <span className="flex items-center gap-0.5 text-primary-3 font-semibold truncate max-w-[120px]" title={student.clubOrCouncil}>
                    <AwardIcon className="w-3 h-3 text-primary-3 inline mr-0.5" />
                    {student.clubOrCouncil}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Batch badge - shrink-0 prevents touching bounds */}
          {student.batch && (
            <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-primary-1/15 text-primary-3 text-[10px] font-extrabold border border-primary-2/20">
              {student.batch}
            </span>
          )}
        </div>

        {/* Academics Grid - always rendered at exact same dimensions */}
        <div className="grid grid-cols-2 gap-2 text-center h-[2.8rem]">
          <div className={class12 ? "bg-secondary-1/40 border border-primary-1/10 rounded-xl py-1.5 px-2" : "bg-gray-50/50 border border-gray-100 rounded-xl py-1.5 px-2"}>
            <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">Class XII</span>
            <span className={`text-[11px] font-extrabold ${class12 ? 'text-brand-black' : 'text-gray-300'}`}>
              {class12 ? `${class12}%` : 'N/A'}
            </span>
          </div>
          {jeeMains && <div className={jeeMains ? "bg-secondary-1/40 border border-primary-1/10 rounded-xl py-1.5 px-2" : "bg-gray-50/50 border border-gray-100 rounded-xl py-1.5 px-2"}>
            <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wider">JEE Mains</span>
            <span className={`text-[11px] font-extrabold ${jeeMains ? 'text-brand-black' : 'text-gray-300'}`}>
              {jeeMains ? `${jeeMains}%ile` : 'N/A'}
            </span>
          </div>}
        </div>

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
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[9px] font-medium border border-gray-100 shadow-sm">
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
                  className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition-all duration-200 cursor-pointer ${isActive
                    ? 'bg-primary-2 text-white shadow-sm ring-1 ring-primary-3/30'
                    : 'bg-gray-100 text-gray-500 hover:bg-primary-1/20 hover:text-brand-black'
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
                href={student.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-[#0A66C2] transition-colors"
                title="LinkedIn"
              >
                <LinkedInIcon />
              </a>
            )}
            {student.github && (
              <a
                href={student.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-brand-black transition-colors"
                title="GitHub"
              >
                <GitHubIcon />
              </a>
            )}
          </div>

          {/* Premium capsule button for opening profile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-brand-black text-white text-[10px] font-bold group-hover:bg-primary-1 group-hover:text-brand-black transition-all duration-300 shadow-sm"
          >
            View Profile
            <span className="inline-block group-hover:translate-x-0.5 transition-transform duration-300">&rarr;</span>
          </button>
        </div>
      </div>
    </article>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentList() {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.students);

  // Filter States
  const [searchInput, setSearchInput] = useState('');
  const [selectedClassOf, setSelectedClassOf] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [hasInternship, setHasInternship] = useState(false);
  const [hasOpenSource, setHasOpenSource] = useState(false);
  const [hasStartup, setHasStartup] = useState(false);
  const [minClass12, setMinClass12] = useState('');
  const [minJee, setMinJee] = useState('');

  // Mobile drawer state
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Student detail modal state
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Fetch all students once on mount
  useEffect(() => {
    dispatch(fetchStudents({}));
  }, [dispatch]);

  const openModal = useCallback((student) => setSelectedStudent(student), []);
  const closeModal = useCallback(() => setSelectedStudent(null), []);

  // Dynamically extract unique option values from all loaded students
  const { allBatches, allCities, allClassOf, popularTags } = useMemo(() => {
    const batchesSet = new Set();
    const citiesSet = new Set();
    const classOfSet = new Set();
    const tagsCounter = {};

    list.forEach((student) => {
      if (student.batch) batchesSet.add(student.batch.trim());
      if (student.city) citiesSet.add(student.city.trim());
      if (student.classOf) classOfSet.add(student.classOf.trim());

      const parsedTags = parseTechTags(student.techStack);
      parsedTags.forEach((tag) => {
        const cleanTag = tag.trim();
        if (cleanTag && cleanTag !== '#REF!' && !cleanTag.startsWith('#')) {
          tagsCounter[cleanTag] = (tagsCounter[cleanTag] || 0) + 1;
        }
      });
    });

    const sortedBatches = Array.from(batchesSet).sort();
    const sortedCities = Array.from(citiesSet).sort();
    const sortedClassOf = Array.from(classOfSet).sort();

    // Get tags sorted by frequency
    const sortedTags = Object.entries(tagsCounter)
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    return {
      allBatches: sortedBatches,
      allCities: sortedCities,
      allClassOf: sortedClassOf,
      popularTags: sortedTags,
    };
  }, [list]);

  // Handle toggling tags in multi-filter
  const handleTagToggle = useCallback((tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  // Clear all filters action
  const handleClearAll = useCallback(() => {
    setSearchInput('');
    setSelectedClassOf('');
    setSelectedCity('');
    setSelectedTags([]);
    setHasInternship(false);
    setHasOpenSource(false);
    setHasStartup(false);
    setMinClass12('');
    setMinJee('');
  }, []);

  // Compute final filtered student list in memory (instant)
  const filteredStudents = useMemo(() => {
    return list.filter((student) => {
      // 1. Text Search
      if (searchInput.trim()) {
        const query = searchInput.toLowerCase().trim();
        const matchesSearchText =
          String(student.name || '').toLowerCase().includes(query) ||
          String(student.city || '').toLowerCase().includes(query) ||
          String(student.school || '').toLowerCase().includes(query) ||
          String(student.oneLiner || '').toLowerCase().includes(query) ||
          String(student.techStack || '').toLowerCase().includes(query) ||
          String(student.projectTitleSem1 || '').toLowerCase().includes(query) ||
          String(student.projectStackSem1 || '').toLowerCase().includes(query) ||
          String(student.projectTitleSem2 || '').toLowerCase().includes(query) ||
          String(student.projectStackSem2 || '').toLowerCase().includes(query);

        if (!matchesSearchText) return false;
      }

      // 2. Batch filter removed

      // 3. Class of Cohort
      if (selectedClassOf && student.classOf !== selectedClassOf) {
        return false;
      }

      // 4. City
      if (selectedCity && student.city !== selectedCity) {
        return false;
      }

      // 5. Tech tags (must match all selected tags)
      if (selectedTags.length > 0) {
        const studentTags = parseTechTags(student.techStack).map((t) => t.toLowerCase());
        const matchesAllTags = selectedTags.every((tag) =>
          studentTags.includes(tag.toLowerCase())
        );
        if (!matchesAllTags) return false;
      }

      // 6. Internship
      if (hasInternship && !student.internships) {
        return false;
      }

      // 7. Open Source
      if (hasOpenSource && !student.openSource) {
        return false;
      }

      // 8. Startup
      if (hasStartup && !student.startupLink) {
        return false;
      }

      // 9. Class 12% cutoff
      if (minClass12) {
        const score = parseFloat(student.class12);
        if (isNaN(score) || score < parseFloat(minClass12)) {
          return false;
        }
      }

      // 10. JEE percentile cutoff
      if (minJee) {
        const score = parseFloat(student.jeeMains);
        if (isNaN(score) || score < parseFloat(minJee)) {
          return false;
        }
      }

      return true;
    });
  }, [
    list,
    searchInput,
    selectedClassOf,
    selectedCity,
    selectedTags,
    hasInternship,
    hasOpenSource,
    hasStartup,
    minClass12,
    minJee,
  ]);

  // Count active filters to display clear states
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchInput) count++;
    if (selectedClassOf) count++;
    if (selectedCity) count++;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (hasInternship) count++;
    if (hasOpenSource) count++;
    if (hasStartup) count++;
    if (minClass12) count++;
    if (minJee) count++;
    return count;
  }, [
    searchInput,
    selectedClassOf,
    selectedCity,
    selectedTags,
    hasInternship,
    hasOpenSource,
    hasStartup,
    minClass12,
    minJee,
  ]);

  return (
    <>
      <SEOMeta
        title="Student Directory | Portfolio Compass"
        description="Browse student portfolios with academic achievements, technical skills, open source contributions and projects."
        path="/students"
      />


      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── FILTER SIDEBAR (DESKTOP) ────────────────────────────────────────── */}
          <aside className="w-full lg:w-80 shrink-0 sticky top-24 self-start hidden lg:block z-20">
            <div className="card-surface p-6 space-y-6 bg-white/95 backdrop-blur border border-black/5 rounded-3xl shadow-card max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-md font-bold text-brand-black flex items-center gap-2">
                  <FilterIcon /> Filters
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-semibold text-primary-3 hover:text-primary-2 transition-colors"
                  >
                    Clear All ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* 1. Search Box */}
              <div>
                <label htmlFor="search-desktop" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Search
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <SearchIcon />
                  </span>
                  <input
                    id="search-desktop"
                    type="text"
                    placeholder="Name, city, tech stack..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-black/10 bg-white text-sm focus:border-primary-2 focus:ring-2 focus:ring-primary-1/30 transition-all"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>
              </div>

              {/* 2. Batch filter removed */}

              {/* 3. Cohort (Class of) */}
              {allClassOf.length > 0 && (
                <div>
                  <label htmlFor="cohort-desktop" className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CohortIcon />Cohort
                  </label>
                  <select
                    id="cohort-desktop"
                    value={selectedClassOf}
                    onChange={(e) => setSelectedClassOf(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-sm focus:border-primary-2 focus:ring-2 focus:ring-primary-1/30 transition-all"
                  >
                    <option value="">All cohorts</option>
                    {allClassOf.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 4. City selection */}
              {allCities.length > 0 && (
                <div>
                  <label htmlFor="city-desktop" className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <PinIcon />City
                  </label>
                  <select
                    id="city-desktop"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 bg-white text-sm focus:border-primary-2 focus:ring-2 focus:ring-primary-1/30 transition-all"
                  >
                    <option value="">All cities</option>
                    {allCities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 5. Toggles for activities */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <BriefcaseIcon />Experience & Activities
                </label>
                <div className="space-y-2.5 mt-2">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasOpenSource}
                      onChange={(e) => setHasOpenSource(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-2 border-gray-300 focus:ring-primary-1/40"
                    />
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-black transition-colors">
                      Open Source Contribution
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasInternship}
                      onChange={(e) => setHasInternship(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-2 border-gray-300 focus:ring-primary-1/40"
                    />
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-black transition-colors">
                      Internship Experience
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={hasStartup}
                      onChange={(e) => setHasStartup(e.target.checked)}
                      className="w-4 h-4 rounded text-primary-2 border-gray-300 focus:ring-primary-1/40"
                    />
                    <span className="text-xs font-semibold text-gray-600 group-hover:text-brand-black transition-colors">
                      Startup / Founder Project
                    </span>
                  </label>
                </div>
              </div>

              {/* 6. Academic Cutoffs */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <TargetIcon />Academic metrics
                </label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label htmlFor="min12-desktop" className="block text-[10px] text-gray-400 font-bold mb-1">
                      Min XII %
                    </label>
                    <input
                      id="min12-desktop"
                      type="number"
                      placeholder="e.g. 80"
                      min="0"
                      max="100"
                      value={minClass12}
                      onChange={(e) => setMinClass12(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs focus:ring-1 focus:ring-primary-1"
                    />
                  </div>
                  <div>
                    <label htmlFor="minJee-desktop" className="block text-[10px] text-gray-400 font-bold mb-1">
                      Min JEE %ile
                    </label>
                    <input
                      id="minJee-desktop"
                      type="number"
                      placeholder="e.g. 90"
                      min="0"
                      max="100"
                      step="any"
                      value={minJee}
                      onChange={(e) => setMinJee(e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-black/10 text-xs focus:ring-1 focus:ring-primary-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* ── MOBILE COLLAPSIBLE FILTERS ───────────────────────────────────── */}
          <div className="w-full lg:hidden z-10">
            <div className="card-surface p-4 bg-white/95 border border-black/5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                {/* Search input mobile */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <SearchIcon />
                  </span>
                  <input
                    type="text"
                    placeholder="Search name, city, tag..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-black/10 bg-white text-sm focus:border-primary-2 focus:ring-2 focus:ring-primary-1/30 transition-all"
                  />
                  {searchInput && (
                    <button
                      onClick={() => setSearchInput('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <CloseIcon />
                    </button>
                  )}
                </div>

                {/* Collapsible toggle */}
                <button
                  onClick={() => setShowMobileFilters((prev) => !prev)}
                  className={`p-2.5 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all ${showMobileFilters || activeFiltersCount > 0
                    ? 'bg-brand-black border-brand-black text-primary-1 shadow-sm'
                    : 'bg-white border-black/10 text-brand-black hover:bg-gray-50'
                    }`}
                >
                  <FilterIcon />
                  <span className="hidden sm:inline">Filters</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary-2 text-white flex items-center justify-center text-[10px]">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Slideable mobile filters */}
              {showMobileFilters && (
                <div className="pt-4 border-t border-gray-100 space-y-5 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-brand-black">Adjust Filters</p>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={handleClearAll}
                        className="text-xs font-semibold text-primary-3 hover:underline"
                      >
                        Clear All ({activeFiltersCount})
                      </button>
                    )}
                  </div>

                  {/* Batch Selector removed */}

                  {/* Select dropdowns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allClassOf.length > 0 && (
                      <div>
                        <label htmlFor="cohort-mobile" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <CohortIcon />Cohort
                        </label>
                        <select
                          id="cohort-mobile"
                          value={selectedClassOf}
                          onChange={(e) => setSelectedClassOf(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
                        >
                          <option value="">All cohorts</option>
                          {allClassOf.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {allCities.length > 0 && (
                      <div>
                        <label htmlFor="city-mobile" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <PinIcon />City
                        </label>
                        <select
                          id="city-mobile"
                          value={selectedCity}
                          onChange={(e) => setSelectedCity(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-black/10 bg-white text-xs"
                        >
                          <option value="">All cities</option>
                          {allCities.map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Experience Checklist */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <BriefcaseIcon />Experience
                    </label>
                    <div className="flex flex-wrap gap-x-4 gap-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasOpenSource}
                          onChange={(e) => setHasOpenSource(e.target.checked)}
                          className="w-4 h-4 rounded text-primary-2 border-gray-300"
                        />
                        <span className="text-xs font-semibold text-gray-600">Open Source</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasInternship}
                          onChange={(e) => setHasInternship(e.target.checked)}
                          className="w-4 h-4 rounded text-primary-2 border-gray-300"
                        />
                        <span className="text-xs font-semibold text-gray-600">Internship</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasStartup}
                          onChange={(e) => setHasStartup(e.target.checked)}
                          className="w-4 h-4 rounded text-primary-2 border-gray-300"
                        />
                        <span className="text-xs font-semibold text-gray-600">Startup Founder</span>
                      </label>
                    </div>
                  </div>

                  {/* Academic metrics */}
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <TargetIcon />Academic Cutoffs
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          type="number"
                          placeholder="Min XII %"
                          value={minClass12}
                          onChange={(e) => setMinClass12(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          placeholder="Min JEE %ile"
                          value={minJee}
                          onChange={(e) => setMinJee(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-black/10 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── STUDENT DIRECTORY LIST ───────────────────────────────────────── */}
          <div className="flex-1 w-full">

            {/* Active Filters Display Chips */}
            {activeFiltersCount > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2 animate-fade-in">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wide">
                  Active Filters:
                </span>

                {searchInput && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9EA] text-primary-3 text-[11px] font-bold border border-primary-1/20 shadow-sm">
                    Search: "{searchInput}"
                    <button onClick={() => setSearchInput('')} className="hover:text-primary-2 transition-colors flex items-center" aria-label="Remove Search filter">
                      <CloseIcon className="w-2 h-2 ml-0.5 inline-block" />
                    </button>
                  </span>
                )}

                {/* Batch chip removed */}

                {selectedClassOf && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9EA] text-primary-3 text-[11px] font-bold border border-primary-1/20 shadow-sm">
                    Class: {selectedClassOf}
                    <button onClick={() => setSelectedClassOf('')} className="hover:text-primary-2 transition-colors flex items-center" aria-label="Remove Class filter">
                      <CloseIcon className="w-2 h-2 ml-0.5 inline-block" />
                    </button>
                  </span>
                )}

                {selectedCity && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9EA] text-primary-3 text-[11px] font-bold border border-primary-1/20 shadow-sm">
                    City: {selectedCity}
                    <button onClick={() => setSelectedCity('')} className="hover:text-primary-2 transition-colors flex items-center" aria-label="Remove City filter">
                      <CloseIcon className="w-2 h-2 ml-0.5 inline-block" />
                    </button>
                  </span>
                )}

                {selectedTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9EA] text-primary-3 text-[11px] font-bold border border-primary-1/20 shadow-sm">
                    Skill: {tag}
                    <button onClick={() => handleTagToggle(tag)} className="hover:text-primary-2 transition-colors flex items-center" aria-label={`Remove Skill ${tag} filter`}>
                      <CloseIcon className="w-2 h-2 ml-0.5 inline-block" />
                    </button>
                  </span>
                ))}

                {hasOpenSource && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100 shadow-sm">
                    Open Source
                    <button onClick={() => setHasOpenSource(false)} className="hover:text-emerald-500 transition-colors flex items-center" aria-label="Remove Open Source filter">
                      <CloseIcon className="w-2 h-2 ml-0.5 inline-block" />
                    </button>
                  </span>
                )}

                {hasInternship && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-[11px] font-bold border border-sky-100 shadow-sm">
                    Internship
                    <button onClick={() => setHasInternship(false)} className="hover:text-sky-500 transition-colors flex items-center" aria-label="Remove Internship filter">
                      <CloseIcon className="w-2 h-2 ml-0.5 inline-block" />
                    </button>
                  </span>
                )}

                {hasStartup && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-100 shadow-sm">
                    Startup
                    <button onClick={() => setHasStartup(false)} className="hover:text-amber-500 transition-colors flex items-center" aria-label="Remove Startup filter">
                      <CloseIcon className="w-2 h-2 ml-0.5 inline-block" />
                    </button>
                  </span>
                )}

                {minClass12 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9EA] text-primary-3 text-[11px] font-bold border border-primary-1/20 shadow-sm">
                    XII: &ge; {minClass12}%
                    <button onClick={() => setMinClass12('')} className="hover:text-primary-2 transition-colors flex items-center" aria-label="Remove Minimum Class 12 score filter">
                      <CloseIcon className="w-2 h-2 ml-0.5 inline-block" />
                    </button>
                  </span>
                )}

                {minJee && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF9EA] text-primary-3 text-[11px] font-bold border border-primary-1/20 shadow-sm">
                    JEE: &ge; {minJee}%ile
                    <button onClick={() => setMinJee('')} className="hover:text-primary-2 transition-colors flex items-center" aria-label="Remove Minimum JEE percentile filter">
                      <CloseIcon className="w-2 h-2 ml-0.5 inline-block" />
                    </button>
                  </span>
                )}

                <button
                  onClick={handleClearAll}
                  className="px-3 py-1 rounded-full border border-dashed border-gray-300 text-gray-400 hover:text-brand-black hover:border-brand-black text-[11px] font-bold transition-all"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Results metadata */}
            <div className="flex justify-between items-center mb-4">
              {!loading && (
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  {filteredStudents.length} profile{filteredStudents.length !== 1 ? 's' : ''} found
                </p>
              )}
            </div>

            {error && (
              <p className="text-red-600 mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-semibold" role="alert">
                {error}
              </p>
            )}

            {loading ? (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <CardSkeleton key={n} />)}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredStudents.map((student, index) => (
                  <StudentCard
                    key={`${student.id}-${index}`}
                    student={student}
                    onOpen={() => openModal(student)}
                    onTagToggle={handleTagToggle}
                    selectedTags={selectedTags}
                  />
                ))}

                {filteredStudents.length === 0 && (
                  <div className="col-span-full text-center py-20 card-surface bg-white/50">
                    <EmptySearchIcon />
                    <p className="text-brand-black font-extrabold text-lg">No profiles found</p>
                    <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
                      No student matches all of the active filters. Try easing search queries or clearing active filters.
                    </p>
                    <button
                      onClick={handleClearAll}
                      className="mt-5 btn-primary !py-2 !px-5 !text-xs font-bold"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Detail Modal overlay */}
      {selectedStudent && (
        <StudentModal student={selectedStudent} onClose={closeModal} />
      )}
    </>
  );
}
