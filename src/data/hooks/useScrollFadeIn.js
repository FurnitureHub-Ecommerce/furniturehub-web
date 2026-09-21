import { useEffect, useRef } from 'react';

export function useScrollFadeIn() {
  const domRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Khi cuộn tới phần tử -> Thêm class hiện lên
            entry.target.classList.add('is-visible');
          } else {
            // Khi lướt lên / ra khỏi khung nhìn -> Bỏ class để lặp lại hiệu ứng
            entry.target.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.15 } // Kích hoạt khi thấy 15% phần tử trên màn hình
    );

    const currentElement = domRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return domRef;
}