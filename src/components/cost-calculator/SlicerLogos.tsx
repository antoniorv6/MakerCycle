import React, { useState } from 'react';
import Image from 'next/image';

interface SlicerLogoProps {
  className?: string;
  size?: number;
}

export const OrcaSlicerLogo: React.FC<SlicerLogoProps> = ({ 
  className = "w-6 h-6", 
  size = 24 
}) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-blue-100 rounded`}>
        <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold text-xs">
          OS
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center bg-blue-100 rounded`}>
      <Image
        src="/orcaslicer-logo.webp"
        alt="OrcaSlicer Logo"
        width={size}
        height={size}
        className="object-contain"
        onError={() => {
          console.error('Error loading OrcaSlicer logo');
          setImageError(true);
        }}
        priority={false}
      />
    </div>
  );
};

export const BambuStudioLogo: React.FC<SlicerLogoProps> = ({ 
  className = "w-6 h-6", 
  size = 24 
}) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 rounded`}>
        <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-xs">
          BS
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center bg-gray-100 rounded`}>
      <Image
        src="/bambustudio-logo.webp"
        alt="BambuStudio Logo"
        width={size}
        height={size}
        className="object-contain"
        onError={() => {
          console.error('Error loading BambuStudio logo');
          setImageError(true);
        }}
        priority={false}
      />
    </div>
  );
};

export const CrealityPrintLogo: React.FC<SlicerLogoProps> = ({ 
  className = "w-6 h-6", 
  size = 24 
}) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-orange-100 rounded`}>
        <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-xs">
          CP
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center bg-orange-100 rounded`}>
      <Image
        src="/creality_print.webp"
        alt="Creality Print Logo"
        width={size}
        height={size}
        className="object-contain"
        onError={() => {
          console.error('Error loading Creality Print logo');
          setImageError(true);
        }}
        priority={false}
      />
    </div>
  );
};

export const AnycubicSlicerNextLogo: React.FC<SlicerLogoProps> = ({ 
  className = "w-6 h-6", 
  size = 24 
}) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-purple-100 rounded`}>
        <div className="w-full h-full flex items-center justify-center text-purple-600 font-bold text-xs">
          AS
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center bg-purple-100 rounded`}>
      <Image
        src="/anycubic_logo.webp"
        alt="AnycubicSlicerNext Logo"
        width={size}
        height={size}
        className="object-contain"
        onError={() => {
          console.error('Error loading AnycubicSlicerNext logo');
          setImageError(true);
        }}
        priority={false}
      />
    </div>
  );
};

export const PrusaSlicerLogo: React.FC<SlicerLogoProps> = ({ 
  className = "w-6 h-6", 
  size = 24 
}) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={`${className} flex items-center justify-center bg-orange-100 rounded`}>
        <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-xs">
          PS
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center bg-orange-100 rounded`}>
      <Image
        src="/prusaslicer-logo.webp"
        alt="PrusaSlicer Logo"
        width={size}
        height={size}
        className="object-contain"
        onError={() => {
          console.error('Error loading PrusaSlicer logo');
          setImageError(true);
        }}
        priority={false}
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
  slicer: 'OrcaSlicer' | 'BambuStudio' | 'CrealityPrint' | 'AnycubicSlicerNext' | 'PrusaSlicer' | 'Unknown';
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
      case 'CrealityPrint':
        return <CrealityPrintLogo className={className} size={size} />;
      case 'AnycubicSlicerNext':
        return <AnycubicSlicerNextLogo className={className} size={size} />;
      case 'PrusaSlicer':
        return <PrusaSlicerLogo className={className} size={size} />;
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
