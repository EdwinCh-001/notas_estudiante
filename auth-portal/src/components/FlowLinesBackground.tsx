export function FlowLinesBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-48 -top-56 h-[34rem] w-[34rem] rounded-full bg-violet-300/25 blur-[110px] dark:bg-violet-600/15" />
      <div className="absolute -right-52 top-[18%] h-[32rem] w-[32rem] rounded-full bg-cyan-300/20 blur-[120px] dark:bg-cyan-500/10" />
      <div className="absolute -bottom-72 left-[28%] h-[34rem] w-[34rem] rounded-full bg-indigo-300/20 blur-[120px] dark:bg-indigo-500/10" />
      <svg
        className="absolute inset-0 h-full w-full opacity-35 dark:opacity-20"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <path
          d="M-110 690C104 586 216 566 388 622s249 102 421 23 274-201 444-174 245 115 358 83"
          stroke="url(#flow-a)"
          strokeWidth="1.2"
        />
        <path
          d="M-110 744c198-91 342-145 493-92s236 113 408 39 280-195 444-163 241 115 376 72"
          stroke="url(#flow-b)"
          strokeWidth="1"
        />
        <path
          d="M-90 796c194-85 349-177 508-120s229 123 403 55 285-189 443-150 235 109 367 55"
          stroke="url(#flow-a)"
          strokeWidth=".8"
        />
        <path
          d="M-80 250c184 69 307 174 480 126s278-145 433-89 244 156 402 128 228-120 325-85"
          stroke="url(#flow-b)"
          strokeWidth=".8"
        />
        <defs>
          <linearGradient id="flow-a" x1="-20" x2="1392" y1="691" y2="621">
            <stop stopColor="#8b7bff" stopOpacity="0" />
            <stop offset=".46" stopColor="#8176f7" stopOpacity=".5" />
            <stop offset="1" stopColor="#48c8ce" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="flow-b" x1="20" x2="1320" y1="744" y2="650">
            <stop stopColor="#45bdd3" stopOpacity="0" />
            <stop offset=".54" stopColor="#7b86f5" stopOpacity=".4" />
            <stop offset="1" stopColor="#977cff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
