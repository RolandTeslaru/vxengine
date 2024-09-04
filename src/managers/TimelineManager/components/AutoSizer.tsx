"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';

// Custom AutoSizer component
const AutoSizer = ({ children, disableWidth = false, disableHeight = false }) => {
  const containerRef = useRef(null);  // Ref to hold the container
  const [size, setSize] = useState({ width: 0, height: 0 });  // State for storing size

  // Function to measure the size of the container
  const measureSize = useCallback(() => {
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth || 0;
      const height = containerRef.current.offsetHeight || 0;

      setSize({
        width: disableWidth ? undefined : width,
        height: disableHeight ? undefined : height,
      });
    }
  }, [disableWidth, disableHeight]);

  // Effect to initially measure size and add a resize listener
  useEffect(() => {
    // Measure the size once on mount
    measureSize();

    // Add resize event listener to window
    const handleResize = () => measureSize();
    window.addEventListener('resize', handleResize);

    // Optional: ResizeObserver to track element resize (more efficient than window resize listener)
    const resizeObserver = new ResizeObserver(() => {
      measureSize();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();  // Clean up observer
    };
  }, [measureSize]);

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%', position: 'relative' }}>
      {children(size)}
    </div>
  );
};

export default AutoSizer;