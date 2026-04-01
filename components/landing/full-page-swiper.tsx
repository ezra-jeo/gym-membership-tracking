'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Pagination, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/pagination';

interface FullPageSwiperProps {
  children: React.ReactNode[];
  onSlideChange?: (index: number) => void;
}

// Global event for navbar to listen to
const dispatchSlideChange = (index: number) => {
  window.dispatchEvent(new CustomEvent('swiper-slide-change', { detail: { index } }));
};

export function FullPageSwiper({ children, onSlideChange }: FullPageSwiperProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isMobile, setIsMobile] = useState<boolean | null>(null); // null = loading

  useEffect(() => {
    // Immediate check on mount
    setIsMobile(window.innerWidth < 768);
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType) => {
    onSlideChange?.(swiper.activeIndex);
    dispatchSlideChange(swiper.activeIndex);
  }, [onSlideChange]);

  // SSR/Loading: show children immediately without swiper wrapper
  if (isMobile === null) {
    return (
      <div className="full-page-loading">
        {children[0]}
      </div>
    );
  }

  // Mobile: render normally without swiper
  if (isMobile) {
    return (
      <div className="full-page-mobile">
        {children.map((child, index) => (
          <div key={index} className="mobile-section">
            {child}
          </div>
        ))}
      </div>
    );
  }

  // Desktop: full-page swiper with snap - FASTER settings
  return (
    <Swiper
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
        // Dispatch initial slide
        dispatchSlideChange(swiper.activeIndex);
      }}
      onSlideChange={handleSlideChange}
      direction="vertical"
      slidesPerView={1}
      speed={500}
      mousewheel={{
        sensitivity: 0.5,
        thresholdDelta: 30,
        forceToAxis: true,
      }}
      keyboard={{
        enabled: true,
        onlyInViewport: true,
      }}
      pagination={{
        clickable: true,
        bulletClass: 'swiper-pagination-bullet custom-bullet',
        bulletActiveClass: 'swiper-pagination-bullet-active custom-bullet-active',
      }}
      modules={[Mousewheel, Pagination, Keyboard]}
      className="full-page-swiper"
      style={{
        height: '100vh',
        width: '100%',
      }}
    >
      {children.map((child, index) => (
        <SwiperSlide key={index} className="full-page-slide">
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
