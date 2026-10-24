import { ComponentType, SVGAttributes } from 'react';

export interface HomeLinkItem {
  name: string;
  description: string;
  path: string;
  Icon: ComponentType<SVGAttributes<SVGElement>>;
  requiresLogin?: boolean;
}

export interface HomeSection {
  id: string;
  label: string;
  description: string;
  links: HomeLinkItem[];
}
