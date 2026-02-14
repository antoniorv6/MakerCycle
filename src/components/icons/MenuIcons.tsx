'use client'

import React from 'react'

interface IconProps {
  className?: string
}

const IconWrapper = ({ src, alt, className = 'w-8 h-8' }: { src: string; alt: string; className?: string }) => {
  return (
    <div 
      className={className} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        width: '100%',
        height: '100%',
        isolation: 'isolate'
      }}
    >
      <img
        src={src}
        alt={alt}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'contain',
          display: 'block',
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  )
}

export const CalculadoraIcon = ({ className = 'w-8 h-8' }: IconProps) => {
  return <IconWrapper src="/menu_icons/calculadora.svg" alt="Calculadora" className={className} />
}

export const ContabilidadIcon = ({ className = 'w-8 h-8' }: IconProps) => {
  return <IconWrapper src="/menu_icons/contabilidad.svg" alt="Contabilidad" className={className} />
}

export const ClientesIcon = ({ className = 'w-8 h-8' }: IconProps) => {
  return <IconWrapper src="/menu_icons/clientes.svg" alt="Clientes" className={className} />
}

export const ProyectosIcon = ({ className = 'w-8 h-8' }: IconProps) => {
  return <IconWrapper src="/menu_icons/proyectos.svg" alt="Proyectos" className={className} />
}

export const OrganizacionIcon = ({ className = 'w-8 h-8' }: IconProps) => {
  return <IconWrapper src="/menu_icons/organizacion.svg" alt="Organización" className={className} />
}

export const EquiposIcon = ({ className = 'w-8 h-8' }: IconProps) => {
  return <IconWrapper src="/menu_icons/equipos.svg" alt="Equipos" className={className} />
}

export const ConfiguracionIcon = ({ className = 'w-8 h-8' }: IconProps) => {
  return <IconWrapper src="/menu_icons/configuracon.svg" alt="Configuración" className={className} />
}
