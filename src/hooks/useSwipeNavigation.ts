import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export function useSwipeNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const touchEndY = useRef<number>(0);

  const minSwipeDistance = 150; // 최소 좌우 스와이프 픽셀 (길게 늘림)
  const maxVerticalDrift = 60; // 상하 드래그 허용치

  useEffect(() => {
    // 메인화면(/)에서는 좌우 스와이핑으로 인한 뒤로가기를 방지할 수 있습니다.
    // 하지만 우선 모든 화면에 적용합니다.
    
    const onTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.targetTouches[0].clientX;
      touchStartY.current = e.targetTouches[0].clientY;
      touchEndX.current = 0;
      touchEndY.current = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      touchEndX.current = e.targetTouches[0].clientX;
      touchEndY.current = e.targetTouches[0].clientY;
    };

    const onTouchEnd = () => {
      if (!touchStartX.current || !touchEndX.current) return;

      const distanceX = touchStartX.current - touchEndX.current;
      const distanceY = Math.abs(touchStartY.current - touchEndY.current);
      
      const isLeftSwipe = distanceX > minSwipeDistance;
      const isRightSwipe = distanceX < -minSwipeDistance;

      // 수직 방향 이동폭이 크면 일반 스크롤로 간주하고 무시
      if (distanceY > maxVerticalDrift) {
        return;
      }

      if (isLeftSwipe) {
        // 좌측으로 스와이프 (우측 화면으로 이동 = Forward)
        navigate(1); 
      }
      if (isRightSwipe) {
        // 우측으로 스와이프 (좌측 화면으로 이동 = Back)
        if (location.pathname !== '/') {
          navigate(-1);
        }
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [navigate, location.pathname]);
}
