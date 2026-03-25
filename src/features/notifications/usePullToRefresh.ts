import { useState, useCallback, useEffect } from 'react';
import type { RefObject } from 'react';

export function usePullToRefresh(
  scrollRef: RefObject<HTMLDivElement | null>,
  onRefresh: () => void,
  isRefreshing: boolean = false
) {
  const [startY, setStartY] = useState(0);
  const [pullDist, setPullDist] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const threshold = 60; // 새로고침 발동 임계값 (px)

  useEffect(() => {
    if (isRefreshing) {
      setPullDist(threshold);
    } else if (!isPulling) {
      setPullDist(0);
    }
  }, [isRefreshing, isPulling, threshold]);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    // 스크롤이 최상단(또는 거의 최상단)일 때만 당기기 시작
    if (scrollRef.current && scrollRef.current.scrollTop <= 2) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  }, [scrollRef]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const dist = currentY - startY;

    // 아래로 당길 때만 계산 (저항값 없음 - 당긴 거리 = 화면 이동)
    if (dist > 0) {
      setPullDist(Math.min(dist, threshold + 30));
      // 네이티브 스크롤 방지
      if (e.cancelable) e.preventDefault();
    }
  }, [isPulling, isRefreshing, startY, threshold]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling) return;
    setIsPulling(false);
    
    if (pullDist >= threshold) {
      if (!isRefreshing) onRefresh();
    } else {
      setPullDist(0);
    }
  }, [isPulling, pullDist, threshold, isRefreshing, onRefresh]);

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
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, scrollRef, scrollRef.current]);

  return { pullDist, isPullRate: Math.min(pullDist / threshold, 1), isPulling };
}
