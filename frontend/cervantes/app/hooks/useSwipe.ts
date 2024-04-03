import { useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';

export function useSwipe(onSwipeLeft, onSwipeRight, rangeOffset = 4) {
    const windowWidth = Dimensions.get('window').width;
    const firstTouch = useRef(0);
    const isMultiTouch = useRef(false);

    const onTouchStart = useCallback((e) => {
        if (e.nativeEvent.touches.length > 1) {
            isMultiTouch.current = true; // Multi-touch gesture detected
            return;
        }
        firstTouch.current = e.nativeEvent.touches[0].pageX;
    }, []);

    const onTouchEnd = useCallback((e) => {
        if (isMultiTouch.current) {
            isMultiTouch.current = false; // Reset for the next gesture
            return;
        }
        const lastTouch = e.nativeEvent.changedTouches[0].pageX;
        const range = windowWidth / rangeOffset;

        if (lastTouch - firstTouch.current > range) {
            onSwipeRight && onSwipeRight();
        } else if (firstTouch.current - lastTouch > range) {
            onSwipeLeft && onSwipeLeft();
        }
    }, [onSwipeLeft, onSwipeRight, rangeOffset, windowWidth]);

    return { onTouchStart, onTouchEnd };
}
