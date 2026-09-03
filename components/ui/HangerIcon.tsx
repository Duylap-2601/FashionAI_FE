import React from 'react';

export interface HangerIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
}

export function HangerIcon({
  size = 16,
  className = '',
  width,
  height,
  ...props
}: HangerIconProps) {
  const w = width ?? size;
  const h = height ?? size;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={w}
      height={h}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Hook curving naturally from the top neck */}
      <path d="M14 6a2 2 0 1 0-4 0c0 1.667.67 3 2 3.844l-7.584 5.568A1.3 1.3 0 0 0 5.2 18h13.6a1.3 1.3 0 0 0 .784-2.588L12 9.844" />
    </svg>
  );
}

export default HangerIcon;
