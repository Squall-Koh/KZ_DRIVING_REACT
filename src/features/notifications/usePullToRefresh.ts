import { useState, useCallback, useEffect } from 'react';
import type { RefObject } from 'react';

export function usePullToRefresh(
  scrollRef: RefObject<HTMLDivElement | null>,
  onRefresh: () => void
) {
  const [startY, setStartY] = useState(0);
  const [pullDist, setPullDist] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const threshold = 60; // 새로고침 발동 임계값 (px)

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // 스크롤이 최상단일 때만 당기기 시작
    if (scrollRef.current && scrollRef.current.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, [scrollRef]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling) return;
    const currentY = e.touches[0].clientY;
    const dist = currentY - startY;

    // 아래로 당길 때만 계산
    if (dist > 0) {
      // 당기는 저항력 적용 (실제 거리의 30%)
      setPullDist(Math.min(dist * 0.3, threshold + 20));
      // 네이티브 스크롤 방지
      if (e.cancelable) e.preventDefault();
    }
  }, [isPulling, startY, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling) return;
    if (pullDist >= threshold) {
      onRefresh();
    }
    setPullDist(0);
    setIsPulling(false);
  }, [isPulling, pullDist, threshold, onRefresh]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, scrollRef]);

  return { pullDist, isPullRate: Math.min(pullDist / threshold, 1) };
}
