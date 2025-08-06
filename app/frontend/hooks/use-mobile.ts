import { useState, useEffect } from 'react';

const MOBILE_WIDTH_THRESHOLD = 768; // Standard breakpoint for mobile

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth &lt; MOBILE_WIDTH_THRESHOLD);
    };

    // Set initial value
    handleResize();

    // Listen for window resize events
    window.addEventListener('resize', handleResize);

    // Clean up the event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
}
