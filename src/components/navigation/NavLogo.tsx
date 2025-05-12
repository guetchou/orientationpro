
import React from 'react';
import { Link } from 'react-router-dom';

export const NavLogo = () => {
  return (
    <Link to="/" className="flex items-center">
      <span className="font-bold text-xl text-primary">OrientationPro</span>
    </Link>
  );
};
