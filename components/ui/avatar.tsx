import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}
export const Avatar: React.FC<AvatarProps> = ({ className, children, ...props }) => (
  <span
    className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}
    {...props}
  >
    {children}
  </span>
);

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {}
export const AvatarImage: React.FC<AvatarImageProps> = ({ className, ...props }) => (
  <img className={`aspect-square h-full w-full ${className}`} {...props} />
);

interface AvatarFallbackProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: React.ReactNode;
}
export const AvatarFallback: React.FC<AvatarFallbackProps> = ({ className, children, ...props }) => (
  <span
    className={`flex h-full w-full items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 ${className}`}
    {...props}
  >
    {children}
  </span>
);