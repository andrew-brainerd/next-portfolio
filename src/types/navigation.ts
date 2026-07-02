import { ComponentType, SVGAttributes } from 'react';

export interface NavLink {
  href: string;
  label: string;
  Icon: ComponentType<SVGAttributes<SVGElement>>;
}
