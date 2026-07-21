// page-flip (StPageFlip) ships no type declarations — this covers the surface
// the StorybookReader uses. API: https://nodlik.github.io/StPageFlip/
declare module 'page-flip' {
  export interface PageFlipSettings {
    width: number;
    height: number;
    size?: 'fixed' | 'stretch';
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    showCover?: boolean;
    usePortrait?: boolean;
    drawShadow?: boolean;
    maxShadowOpacity?: number;
    flippingTime?: number;
    startPage?: number;
    mobileScrollSupport?: boolean;
    swipeDistance?: number;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    autoSize?: boolean;
  }

  export interface FlipEvent {
    data: number | string;
    object: PageFlip;
  }

  export class PageFlip {
    constructor(element: HTMLElement, settings: PageFlipSettings);
    loadFromHTML(items: NodeListOf<Element> | Element[]): void;
    updateFromHtml(items: NodeListOf<Element> | Element[]): void;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    flip(pageNum: number, corner?: 'top' | 'bottom'): void;
    turnToPage(pageNum: number): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    on(eventName: 'flip' | 'changeOrientation' | 'changeState' | 'init' | 'update', callback: (event: FlipEvent) => void): void;
    destroy(): void;
  }
}
