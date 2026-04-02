'use client';

import { useEffect } from 'react';

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;

    const reloadOnControllerChange = () => {
      if (sessionStorage.getItem('stren.sw.reloaded') === '1') return;
      sessionStorage.setItem('stren.sw.reloaded', '1');
      window.location.reload();
    };

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        await registration.update();

        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      } catch (error) {
        console.error('Service worker registration failed:', error);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', reloadOnControllerChange);
    window.addEventListener('load', registerServiceWorker);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', reloadOnControllerChange);
      window.removeEventListener('load', registerServiceWorker);
    };
  }, []);

  return null;
}
