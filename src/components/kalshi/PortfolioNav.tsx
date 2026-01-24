'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/kalshme/positions', label: 'Positions' },
  { href: '/kalshme/settlements', label: 'Settlements' }
];

const PortfolioNav = () => {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-gray-700 mb-6">
      {tabs.map(tab => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-6 py-3 font-medium transition-colors relative ${
              isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
            {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
          </Link>
        );
      })}
      <div className="flex-1 flex justify-end items-center pr-2">
        <Link href="/kalshme/orders" className="text-blue-400 hover:text-blue-300 text-sm">
          View Orders →
        </Link>
      </div>
    </div>
  );
};

export default PortfolioNav;
