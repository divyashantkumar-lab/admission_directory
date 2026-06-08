import React, { useState } from 'react';
import { driveToDirectImg, getInitials, mergeClasses } from '../utils/helpers';

export default function Avatar({ student, size = 'md', className = "" }) {
  const [imgError, setImgError] = useState(false);
  const sizeClasses = {
    sm: 'w-16 h-16 text-xl',
    md: 'w-14 h-14 text-lg',
    lg: 'w-32 h-32 text-4xl',
  };
  const photoUrl = driveToDirectImg(student.photo);

  const finalClassName = mergeClasses(
    `${sizeClasses[size]} rounded-full object-cover ring-4 ring-primary-1/30 shadow-lg group-hover:scale-105 group-hover:ring-primary-2/40 transition-all duration-300`,
    className
  );

  const finalDivClassName = mergeClasses(
    `${sizeClasses[size]} rounded-full bg-gradient-to-br from-primary-1 to-primary-2 text-brand-black flex items-center justify-center font-extrabold ring-4 ring-primary-1/30 shadow-lg group-hover:scale-105 group-hover:ring-primary-2/40 transition-all duration-300`,
    className
  );

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={student.name}
        onError={() => setImgError(true)}
        className={finalClassName}
      />
    );
  }

  return (
    <div className={finalDivClassName}>
      {getInitials(student.name)}
    </div>
  );
}

