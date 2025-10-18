import React from 'react';

interface SteamLayoutProps {
  children: React.ReactNode;
}

const SteamLayout = ({ children }: SteamLayoutProps) => {
  return <>{children}</>;
};

export default SteamLayout;
