import React, { useState, useEffect } from 'react';
import { driveToDirectImg, getInitials, mergeClasses } from '../utils/helpers';
import ImageSkeleton from './ImageSkeleton';

function AvatarComponent({ student, size = 'md', className = "", onLoad }) {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const sizeClasses = React.useMemo(() => ({
    sm: 'w-16 h-16 text-xl',
    md: 'w-14 h-14 text-lg',
    lg: 'w-32 h-32 text-4xl',
  }), []);

  const photoUrl = React.useMemo(() => {
    // Use pre-optimized compressedImage from backend if available
    if (student.compressedImage) {
      return student.compressedImage;
    }
    // Fallback to frontend optimization for older data
    return driveToDirectImg(student.profilePicture, 256);
  }, [student.compressedImage, student.profilePicture]);

  // Added opacity transitions to smoothly fade in the image once loaded
  const finalClassName = mergeClasses(
    `avatar ${sizeClasses[size]} rounded-full object-cover ring-4 ring-primary-1/30 shadow-lg group-hover:scale-105 group-hover:ring-primary-2/40 transition-all duration-300 ${
      isLoaded ? 'opacity-100' : 'opacity-0'
    }`,
    className
  );

  const finalDivClassName = mergeClasses(
    `${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-1 to-primary-2 text-brand-black flex items-center justify-center font-extrabold ring-4 ring-primary-1/30 shadow-lg group-hover:scale-105 group-hover:ring-primary-2/40 transition-all duration-300`,
    className
  );

  // Base sizing container template used to align the skeleton overlay exactly with custom sizes
  // const wrapperSizeClass = className.includes('w-') ? className : sizeClasses[size];

  if (photoUrl && !imgError) {
    return (
      <div className={`w-[35%] aspect-square relative rounded-full flex-shrink-0 overflow-hidden`}>
        {/* Lightweight skeleton loader */}
        {!isLoaded && <ImageSkeleton className="absolute inset-0 rounded-full" />}

        <img
          src={photoUrl}
          alt={student.name}
          loading="eager"
          onLoad={() => {
            setIsLoaded(true);
            if (onLoad) onLoad();
          }}
          onError={() => setImgError(true)}
          className={`avatar w-full h-full text-lg rounded-full object-cover ring-4 ring-primary-1/30 shadow-lg transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          decoding="async"
          fetchpriority="high"
        />
      </div>
    );
  }

  return (
    <div className={finalDivClassName}>
      {getInitials(student.name)}
    </div>
  );
}

export default React.memo(AvatarComponent);

// import React, { useState } from 'react';
// import { driveToDirectImg, getInitials, mergeClasses } from '../utils/helpers';

// export default function Avatar({ student, size = 'md', className = "" }) {
//   const [imgError, setImgError]   = useState(false);
//   const [imgLoaded, setImgLoaded] = useState(false);

//   // Only fallback to absolute sizes if responsive layout parameters aren't passed
//   const hasCustomSizing = className.includes('w-') || className.includes('aspect-');

//   const sizeClasses = {
//     sm: hasCustomSizing ? 'text-xl' : 'w-16 h-16 text-xl',
//     md: hasCustomSizing ? 'text-lg' : 'w-14 h-14 text-lg',
//     lg: hasCustomSizing ? 'text-4xl' : 'w-32 h-32 text-4xl',
//   };

//   const photoUrl = driveToDirectImg(student.photo);

//   const finalClassName = mergeClasses(
//     `${sizeClasses[size]} rounded-full object-cover ring-4 ring-primary-1/30 shadow-lg group-hover:scale-105 group-hover:ring-primary-2/40 transition-all duration-300`,
//     className
//   );

//   const finalDivClassName = mergeClasses(
//     `${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-1 to-primary-2 text-brand-black flex items-center justify-center font-extrabold ring-4 ring-primary-1/30 shadow-lg group-hover:scale-105 group-hover:ring-primary-2/40 transition-all duration-300`,
//     className
//   );

//   const skeletonClassName = mergeClasses(
//     `${sizeClasses[size]} rounded-full skeleton ring-4 ring-primary-1/20`,
//     className
//   );

//   if (photoUrl && !imgError) {
//     return (
//       <div className={mergeClasses('relative', className)}>
//         {/* YouTube-style shimmer skeleton — visible until image loads */}
//         {!imgLoaded && (
//           <div
//             aria-hidden="true"
//             className="absolute inset-0 rounded-full skeleton ring-4 ring-primary-1/20"
//           />
//         )}
//         <img
//           src={photoUrl}
//           alt={student.name}
//           onLoad={() => setImgLoaded(true)}
//           onError={() => setImgError(true)}
//           className={mergeClasses(
//             finalClassName,
//             imgLoaded ? 'opacity-100 transition-opacity duration-300' : 'opacity-0'
//           )}
//         />
//       </div>
//     );
//   }

//   return (
//     <div className={finalDivClassName}>
//       {getInitials(student.name)}
//     </div>
//   );
// }

