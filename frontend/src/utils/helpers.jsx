import React from 'react';
import { AttachmentIcon } from '../components/icons';

export function ensureHttps(url) {
    if (!url) return url;
    const trimmed = url.trim();
    if (/^https:\/\//i.test(trimmed)) {
        return trimmed;
    }
    if (/^http:\/\//i.test(trimmed)) {
        return trimmed.replace(/^http:\/\//i, 'https://');
    }
    return `https://${trimmed}`;
}

export function getInitials(name) {
    return (name || '?')
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function parseTechTags(techStack, limit) {
    if (!techStack) return [];
    const tags = techStack
        .split(/[\n|]/)
        .map((t) => t.split(':')[0].trim().replace(/-\d+$/, ''))
        .filter((t) => t && t !== '#REF!' && !t.startsWith('#'));
    return limit ? tags.slice(0, limit) : tags;
}

// Helper to merge default classes with custom className overrides, preventing conflicting width/height styles in Tailwind
export function mergeClasses(defaultClasses, passedClasses = '') {
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

export function renderTextWithLinks(text) {
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
export function driveToEmbed(url) {
    if (!url) return null;
    const fileMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileMatch) return `https://drive.google.com/file/d/${fileMatch[1]}/preview`;
    const openMatch = url.match(/[?&]id=([^&]+)/);
    if (openMatch) return `https://drive.google.com/file/d/${openMatch[1]}/preview`;
    return url;
}

export function driveToDirectImg(url, width = 600) {
    if (!url) return null;
    const fileMatch = url.match(/\/file\/d\/([^/&?#]+)/);
    if (fileMatch) {
      // Ultra-aggressive compression for faster delivery
      // =s{width} = size, =q65 = quality 65% (imperceptible loss, 30% smaller), =rw = responsive web, =c = crop
      return `https://lh3.googleusercontent.com/d/${fileMatch[1]}=s${width}-q65-rw-c`;
    }

    const openMatch = url.match(/[?&]id=([^&?#]+)/);
    if (openMatch) {
      return `https://lh3.googleusercontent.com/d/${openMatch[1]}=s${width}-q65-rw-c`;
    }

    return url;
}

export function driveToDirectVideo(url) {
    if (!url) return null;
    
    // Extract the File ID from various Google Drive URL formats
    const fileIdMatch = url.match(/(?:\/file\/d\/|id=)([a-zA-Z0-9_-]{25,35})/);
    
    if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        
        // Option A: Best for HTML5 <video> tags or direct streaming/downloading
        return `https://docs.google.com/uc?export=download&id=${fileId}`;
        
        // Option B: Best for <iframe> src if you want the Google Drive video player interface
        // return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return url;
}

export function isVideoLink(url) {
    if (!url) return false;
    return (
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('drive.google.com')
    );
}

export function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    const match = url.match(/(?:v=|\/shorts\/|youtu\.be\/)([^&?/]+)/);
    if (match) return `https://www.youtube.com/embed/${match[1]}`;
    return null;
}
