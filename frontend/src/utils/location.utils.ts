// utils/location.utils.ts
export interface GeolocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

export interface IPLocationData {
    ip: string;
    country?: string;
    region?: string;
    city?: string;
    timezone?: string;
}

/**
 * Get user's current geolocation using the Geolocation API
 * @param timeout - Timeout in milliseconds (default: 10000)
 * @returns Promise with geolocation data or null if unavailable/denied
 */
export const getCurrentLocation = async (timeout = 10000): Promise<GeolocationData | null> => {
    return new Promise((resolve) => {
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by this browser');
            resolve(null);
            return;
        }

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: timeout,
            maximumAge: 300000, // 5 minutes cache
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { coords, timestamp } = position;
                resolve({
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    accuracy: coords.accuracy,
                    timestamp: timestamp,
                });
            },
            (error) => {
                console.warn('Geolocation error:', error.message);
                // Don't throw error, just return null to gracefully handle permission denials
                resolve(null);
            },
            options
        );
    });
};


/**
 * Collect all available location metadata (geolocation + IP)
 * @returns Promise with combined location data
 */
export const collectLocationMetadata = async (): Promise<{
    geolocation: GeolocationData | null;
}> => {
    // Run both requests in parallel for better performance
    const [geolocation] = await Promise.all([
        getCurrentLocation(),
    ]);

    return {
        geolocation,
    };
};
