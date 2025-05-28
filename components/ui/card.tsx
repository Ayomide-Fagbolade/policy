import { ReactNode } from 'react';

// Flexible Card Component that accepts children

type CardProps = {
  className?: string;
  children?: ReactNode;
};

export default function Card({
  className = "",
  children
}: CardProps) {
  return (
    <div className={`max-w-sm rounded-lg overflow-hidden shadow-lg bg-white ${className}`}>
      {/* Children for custom content */}
      {children}
    </div>
  );
}