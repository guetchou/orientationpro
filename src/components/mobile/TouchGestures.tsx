import { useGesture } from '@use-gesture/react';
import { useSpring, animated } from 'react-spring';
import { ReactNode, useRef } from 'react';

interface TouchGesturesProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  enablePullToRefresh?: boolean;
  onPullToRefresh?: () => void;
  className?: string;
}

export const TouchGestures = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  enablePullToRefresh = false,
  onPullToRefresh,
  className = ''
}: TouchGesturesProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const [{ x, y, scale, rotateZ }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    rotateZ: 0,
    config: { mass: 1, tension: 350, friction: 40 }
  }));

  const [{ pullY }, pullApi] = useSpring(() => ({
    pullY: 0,
    config: { tension: 300, friction: 30 }
  }));

  const bind = useGesture(
    {
      onDrag: ({ movement: [mx, my], direction: [dx, dy], distance, cancel, last }) => {
        // Pull to refresh
        if (enablePullToRefresh && my > 0 && window.scrollY === 0) {
          if (my > 100 && last) {
            onPullToRefresh?.();
            pullApi.start({ pullY: 0 });
          } else {
            pullApi.start({ pullY: Math.min(my, 120) });
          }
          return;
        }

        // Swipe gestures
        if (distance > 50 && last) {
          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (dx > 0) {
              onSwipeRight?.();
            } else {
              onSwipeLeft?.();
            }
          } else {
            // Vertical swipe
            if (dy > 0) {
              onSwipeDown?.();
            } else {
              onSwipeUp?.();
            }
          }
        }

        api.start({
          x: last ? 0 : mx,
          y: last ? 0 : my,
          scale: last ? 1 : 1 + distance * 0.0001,
          rotateZ: last ? 0 : mx * 0.1
        });
      },
      
      onPinch: ({ offset: [scale], last }) => {
        onPinch?.(scale);
        api.start({ scale: last ? 1 : scale });
      },
      
      onWheel: ({ delta: [, dy] }) => {
        // Zoom avec la molette sur desktop
        if (onPinch) {
          const newScale = Math.max(0.5, Math.min(3, scale.get() - dy * 0.001));
          onPinch(newScale);
          api.start({ scale: newScale });
        }
      }
    },
    {
      drag: {
        filterTaps: true,
        threshold: 10
      },
      pinch: {
        scaleBounds: { min: 0.5, max: 3 },
        rubberband: true
      }
    }
  );

  return (
    <>
      {/* Pull to refresh indicator */}
      {enablePullToRefresh && (
        <animated.div
          style={{
            transform: pullY.to(py => `translateY(${py - 120}px)`),
            opacity: pullY.to([0, 60, 120], [0, 0.5, 1])
          }}
          className="fixed top-0 left-0 right-0 h-20 bg-blue-500 text-white flex items-center justify-center z-40"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-2"></div>
            <span className="text-sm">Actualisation...</span>
          </div>
        </animated.div>
      )}

      <animated.div
        ref={ref}
        {...bind()}
        style={{
          x,
          y,
          scale,
          rotateZ,
          transform: enablePullToRefresh 
            ? pullY.to(py => `translateY(${py * 0.3}px)`)
            : undefined
        }}
        className={`touch-pan-y touch-manipulation ${className}`}
      >
        {children}
      </animated.div>
    </>
  );
};
