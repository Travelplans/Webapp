import React from 'react';
import { logoSrc } from '../../assets/logo'; // Import from the new dedicated file

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => (
  <img src={logoSrc} alt="Travelplans.fun Logo" className={className} />
);

export default Logo;
