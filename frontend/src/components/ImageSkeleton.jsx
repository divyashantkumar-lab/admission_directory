import React from 'react';

const ImageSkeleton = ({ className = '' }) => {
  return (
    <div className={`${className} overflow-hidden bg-gray-200`}>
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
        style={{
          animation: 'shimmer 1.5s infinite',
          transform: 'translateX(-100%)',
        }}
      />
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default ImageSkeleton;
