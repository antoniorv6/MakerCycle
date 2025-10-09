import React from 'react';
import Image from 'next/image';

interface SlicerLogoProps {
  className?: string;
  size?: number;
}

export const OrcaSlicerLogo: React.FC<SlicerLogoProps> = ({ 
  className = "w-6 h-6", 
  size = 24 
}) => {
  return (
    <div className={`${className} flex items-center justify-center bg-blue-100 rounded`}>
      <Image
        src="/orcaslicer-logo.webp"
        alt="OrcaSlicer Logo"
        width={size}
        height={size}
        className="object-contain"
        onError={(e) => {
          console.error('Error loading OrcaSlicer logo:', e);
        }}
      />
    </div>
  );
};

export const BambuStudioLogo: React.FC<SlicerLogoProps> = ({ 
  className = "w-6 h-6", 
  size = 24 
}) => {
  return (
    <div className={`${className} flex items-center justify-center bg-gray-100 rounded`}>
      <Image
        src="/bambustudio-logo.webp"
        alt="BambuStudio Logo"
        width={size}
        height={size}
        className="object-contain"
        onError={(e) => {
          console.error('Error loading BambuStudio logo:', e);
        }}
      />
    </div>
  );
};

export const UnknownSlicerLogo: React.FC<SlicerLogoProps> = ({ 
  className = "w-6 h-6", 
  size = 24 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="#6b7280"
      />
      <path
        d="M12 6v6l4 2"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

interface SlicerLogoDisplayProps {
  slicer: 'OrcaSlicer' | 'BambuStudio' | 'Unknown';
  className?: string;
  size?: number;
  showLabel?: boolean;
}

export const SlicerLogoDisplay: React.FC<SlicerLogoDisplayProps> = ({ 
  slicer, 
  className = "w-6 h-6", 
  size = 24,
  showLabel = false 
}) => {
  const getLogo = () => {
    switch (slicer) {
      case 'OrcaSlicer':
        return <OrcaSlicerLogo className={className} size={size} />;
      case 'BambuStudio':
        return <BambuStudioLogo className={className} size={size} />;
      default:
        return <UnknownSlicerLogo className={className} size={size} />;
    }
  };

  if (showLabel) {
    return (
      <div className="flex items-center gap-2">
        {getLogo()}
        <span className="text-sm font-medium text-slate-700">{slicer}</span>
      </div>
    );
  }

  return getLogo();
};

export default SlicerLogoDisplay;
