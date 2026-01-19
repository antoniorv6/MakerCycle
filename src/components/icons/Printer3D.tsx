import React from 'react';

interface Printer3DIconProps {
  className?: string;
  size?: number;
  color?: string;
}

/**
 * Icono de impresora 3D
 * Diseño simple y limpio que representa una impresora 3D FDM típica
 */
export const Printer3D: React.FC<Printer3DIconProps> = ({ 
  className = '', 
  size = 24,
  color = 'currentColor'
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Base de la impresora */}
      <rect x="3" y="15" width="18" height="6" rx="1" />
      
      {/* Estructura vertical (marco) */}
      <rect x="5" y="5" width="14" height="10" rx="1" />
      
      {/* Cama de impresión (plataforma) */}
      <rect x="6" y="12" width="12" height="2" rx="0.5" />
      
      {/* Extrusor/cabezal de impresión */}
      <circle cx="12" cy="8" r="1.5" />
      <line x1="12" y1="8" x2="12" y2="12" />
      
      {/* Líneas decorativas en la estructura */}
      <line x1="7" y1="7" x2="17" y2="7" />
      <line x1="7" y1="9" x2="17" y2="9" />
      
      {/* Patas/soporte */}
      <rect x="4" y="20" width="2" height="1" />
      <rect x="18" y="20" width="2" height="1" />
    </svg>
  );
};

export default Printer3D;
