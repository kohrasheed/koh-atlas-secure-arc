import * as PhosphorIcons from '@phosphor-icons/react';

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export function Icon({ name, className, size = 24 }: IconProps) {
  const IconComponent = (PhosphorIcons as any)[name];
  
  if (!IconComponent) {
    return <PhosphorIcons.Circle className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
}