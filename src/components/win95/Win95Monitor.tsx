interface Win95MonitorProps {
  children: React.ReactNode;
}

/**
 * CRT monitor bezel that frames the Win95 desktop. Fills the viewport (dark "room" background
 * + padding), draws a beige casing with a thick bezel, and hosts the shell inside the screen.
 * The screen is the positioning context for the shell (which is `absolute inset-0`).
 */
export const Win95Monitor = ({ children }: Win95MonitorProps) => (
  <div className="fixed inset-0 flex items-center justify-center bg-[#17171b] p-1.5 sm:p-5">
    <div className="flex h-full w-full max-w-[1600px] flex-col rounded-2xl bg-gradient-to-b from-[#d9d3c0] to-[#bdb6a1] p-2 shadow-[0_24px_70px_rgba(0,0,0,0.65),inset_0_2px_1px_rgba(255,255,255,0.55),inset_0_-3px_4px_rgba(0,0,0,0.25)] sm:rounded-[28px] sm:p-5">
      {/* Screen: recessed black bezel around the live desktop */}
      <div className="relative min-h-0 flex-1 overflow-hidden rounded-md border-4 border-[#2c2c2c] bg-black shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] sm:rounded-lg sm:border-[6px]">
        {children}
        {/* Subtle screen glare */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[60] bg-gradient-to-br from-white/8 via-transparent to-transparent"
        />
      </div>

      {/* Chin: brand + power LED */}
      <div className="flex shrink-0 items-center justify-between px-2 pt-1.5 sm:px-3 sm:pt-3">
        <span className="text-[10px] font-bold italic tracking-wide text-[#736d5b] sm:text-[11px]">
          Brainerd 95
        </span>
        <span className="flex items-center gap-1.5 text-[8px] tracking-widest text-[#736d5b] sm:text-[9px]">
          POWER
          <span className="h-1.5 w-1.5 rounded-full bg-[#46d27a] shadow-[0_0_5px_#46d27a] sm:h-2 sm:w-2" />
        </span>
      </div>
    </div>
  </div>
);
