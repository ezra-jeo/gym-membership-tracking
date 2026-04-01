'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Pagination, Keyboard } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/mousewheel';

interface FullPageSwiperProps {
  children: React.ReactNode[];
  onSlideChange?: (index: number) => void;
}

export function FullPageSwiper({ children, onSlideChange }: FullPageSwiperProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSlideChange = (swiper: SwiperType) => {
    onSlideChange?.(swiper.activeIndex);
  };

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

  // Desktop: full-page swiper with snap
  return (
    <Swiper
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      onSlideChange={handleSlideChange}
      direction="vertical"
      slidesPerView={1}
      speed={800}
      mousewheel={{
        sensitivity: 1,
        thresholdDelta: 50,
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
