import { ComponentPropsWithoutRef, ReactNode } from 'react';

interface IconButtonProps extends ComponentPropsWithoutRef<'button'> {
  icon: ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function IconButton({
  icon,
  label,
  variant = 'primary',
  className = '',
  ...props
}: IconButtonProps) {
  const variantStyles = {
    primary: 'bg-white hover:bg-gray-50',
    secondary: 'bg-gray-100 hover:bg-gray-200',
    danger: 'bg-red-50 hover:bg-red-100 text-red-600',
  };

  return (
    <button
      {...props}
      aria-label={label}
      className={`p-2.5 rounded-xl shadow-lg transition ${variantStyles[variant]} ${className}`}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}
