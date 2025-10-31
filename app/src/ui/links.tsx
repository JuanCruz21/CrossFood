import React from 'react';
import Link from 'next/link';

interface CustomLinkProps {
  href: string;
  children: React.ReactNode;
  variant?: 'default' | 'nav' | 'footer';
  className?: string;
  onClick?: () => void;
}

export const CustomLink: React.FC<CustomLinkProps> = ({ 
  href, 
  children, 
  variant = 'default', 
  className = '',
  onClick
}) => {
  const variants = {
    default: 'text-[var(--primary)] hover:text-[var(--accent)] underline transition-colors duration-200',
    nav: 'text-[var(--foreground)] hover:text-[var(--primary)] font-medium transition-colors duration-200',
    footer: 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors duration-200'
  };
  
  return (
    <Link href={href} className={`${variants[variant]} ${className}`} onClick={onClick}>
      {children}
    </Link>
  );
};
