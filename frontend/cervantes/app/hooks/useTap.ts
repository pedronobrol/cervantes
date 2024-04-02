import { Dimensions } from 'react-native';
const windowWidth = Dimensions.get('window').width;

export function useTap(onDoubleTapLeft?: any, onDoubleTapRight?: any, onTap?: any, delay = 300) {
    let lastTap = null;
    let tapTimer = null;

    // Helper function to identify tap side
    function getTapSide(pageX) {
        return pageX < windowWidth / 2 ? 'left' : 'right';
    }

    // Handle tap start
    function onTouchStart(e) {
        const currentTime = Date.now();
        const tapPositionX = e.nativeEvent.pageX;

        if (lastTap && (currentTime - lastTap) < delay) {
            // Detected double tap
            clearTimeout(tapTimer);
            tapTimer = null;
            lastTap = null;

            if (getTapSide(tapPositionX) === 'left') {
                onDoubleTapLeft && onDoubleTapLeft();
            } else {
                onDoubleTapRight && onDoubleTapRight();
            }
        } else {
            // Handle single tap
            lastTap = currentTime;
            tapTimer = setTimeout(() => {
                onTap && onTap();
                clearTimeout(tapTimer);
                tapTimer = null;
                lastTap = null;
            }, delay);
        }
    }

    // You might not need onTouchEnd for tap detection, but it can be useful for other interactions
    function onTouchEnd(e) {
        // Implement as needed for future use
    }

    return { onTouchStart, onTouchEnd };
}
