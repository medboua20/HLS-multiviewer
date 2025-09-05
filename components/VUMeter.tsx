import React, { useState, useEffect, useRef } from 'react';

interface MeterBarProps {
  level: number; // 0 to 1
  orientation: 'vertical' | 'horizontal';
}

const MeterBar: React.FC<MeterBarProps> = ({ level, orientation }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (element) {
        setSize({ width: element.offsetWidth, height: element.offsetHeight });
      }
    });
    
    resizeObserver.observe(element);
    // Initial size
    setSize({ width: element.offsetWidth, height: element.offsetHeight });

    return () => resizeObserver.disconnect();
  }, []);

  const isVertical = orientation === 'vertical';
  const segmentCount = isVertical 
    ? Math.max(8, Math.floor(size.height / 4))
    : Math.max(12, Math.floor(size.width / 4));

  const clampedLevel = Math.max(0, Math.min(1, level));
  const activeSegments = Math.ceil(clampedLevel * segmentCount);

  const getSegmentColor = (index: number) => {
    const ratio = (index + 1) / segmentCount;
    if (ratio > 0.9) return 'bg-vu-red';
    if (ratio > 0.75) return 'bg-vu-yellow';
    return 'bg-vu-green';
  };

  const segments = Array.from({ length: segmentCount }, (_, i) => {
    const isActive = i < activeSegments;
    const colorClass = isActive ? getSegmentColor(i) : 'bg-gray-800 opacity-60';
    const dimensions = isVertical ? 'h-[2px] w-full' : 'w-[2px] h-full';

    return (
      <div
        key={i}
        className={`rounded-sm transition-colors duration-75 ${colorClass} ${dimensions}`}
      />
    );
  });

  const layoutClass = isVertical
    ? 'relative w-full h-full bg-black rounded-sm p-0.5 flex flex-col-reverse justify-between gap-[2px] overflow-hidden'
    : 'relative h-full w-full bg-black rounded-sm p-0.5 flex flex-row justify-between gap-[2px] overflow-hidden';

  return (
    <div ref={ref} className={layoutClass}>
      {segments}
    </div>
  );
};

interface VUMeterProps {
  leftLevel: number;
  rightLevel: number;
  orientation?: 'vertical' | 'horizontal';
}

const VUMeter: React.FC<VUMeterProps> = ({ leftLevel, rightLevel, orientation = 'vertical' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (element) {
        setSize({ width: element.offsetWidth, height: element.offsetHeight });
      }
    });
    
    resizeObserver.observe(element);
    // Initial size
    setSize({ width: element.offsetWidth, height: element.offsetHeight });
    
    return () => resizeObserver.disconnect();
  }, []);

  if (orientation === 'horizontal') {
    const showLabels = size.height > 32;
    const labels = [
      { val: '-45', left: '2%' }, { val: '-30', left: '20%' }, { val: '-20', left: '40%' },
      { val: '-10', left: '60%' }, { val: '0', left: '85%' }, { val: '+3', left: '96%' }
    ];
    return (
      <div ref={ref} className="flex flex-col items-center w-full h-full p-1 space-y-1">
        <div className="relative w-full flex-1">
          <MeterBar level={leftLevel} orientation="horizontal" />
        </div>
        <div className="relative w-full flex-1">
          <MeterBar level={rightLevel} orientation="horizontal" />
        </div>
        {showLabels && (
          <div className="relative w-full h-4 flex-shrink-0 text-text-secondary font-mono text-[10px] sm:text-xs">
            {labels.map(l => (
              <span key={l.val} className="absolute -translate-x-1/2" style={{ left: l.left, top: 0 }}>
                {l.val}
              </span>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Vertical layout (default)
  const showLabels = size.width > 48;
  const labels = [
    { val: '+3', top: '2%' }, { val: '0', top: '12.5%' }, { val: '-10', top: '35%' },
    { val: '-20', top: '50%' }, { val: '-30', top: '65%' }, { val: '-45', top: '85%' },
  ];

  return (
    <div ref={ref} className="relative flex flex-row items-stretch h-full w-full">
      {/* Left Meter */}
      <div className="flex-1 h-full flex items-center justify-center p-0.5">
        <MeterBar level={leftLevel} orientation="vertical" />
      </div>
      {/* Center Labels */}
      {showLabels && (
        <div className="relative h-full w-8 text-center text-text-secondary font-mono flex-shrink-0">
          {labels.map(l => (
            <span key={l.val} className="absolute -translate-y-1/2 left-1/2 -translate-x-1/2 text-[10px] xl:text-xs" style={{ top: l.top }}>
              {l.val}
            </span>
          ))}
          {size.height > 60 && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-bold text-xs xl:text-sm">dB</span>}
        </div>
      )}
      {/* Right Meter */}
      <div className="flex-1 h-full flex items-center justify-center p-0.5">
        <MeterBar level={rightLevel} orientation="vertical" />
      </div>
    </div>
  );
};

export default VUMeter;