import React from 'react';

interface Printer3DIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  background?: string;
  opacity?: number;
  rotation?: number;
  shadow?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  padding?: number;
  className?: string;
}

/**
 * Icono de impresora 3D
 * Diseño que representa una impresora 3D
 */
const Printer3DIcon: React.FC<Printer3DIconProps> = ({
  size = undefined,
  color = 'currentColor',
  strokeWidth = 2,
  background = 'transparent',
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0,
  className = ''
}) => {
  const transforms = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBoxSize = 24 + (padding * 2);
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      fill="none"
      stroke={color === 'currentColor' ? 'currentColor' : color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{
        opacity,
        transform: transforms.join(' ') || undefined,
        filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
        backgroundColor: background !== 'transparent' ? background : undefined
      }}
    >
      <path 
        fill="none" 
        stroke="currentColor" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={strokeWidth} 
        d="M8 2H2v.5a2 2 0 0 0 2 2h4zm14 0h-6v2.5h4a2 2 0 0 0 2-2zm-6 0H8v8h8zm-2.5 11h-3L8 10h8zm0 0h-3v1.757a3 3 0 0 0 .879 2.122L12 17.5l.621-.621a3 3 0 0 0 .879-2.122zM2 22h8a2 2 0 0 0 2-2m2-15v.01m0 2.49v.01"
      />
    </svg>
  );
};

export const Printer3D = Printer3DIcon;
export default Printer3DIcon;
