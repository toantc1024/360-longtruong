// components/Tracker.tsx or in a layout/page
'use client'; // if using Next.js 13+

import { useEffect, useRef } from 'react';
import { useSessionStore } from '@/store/session.store';
import { createVisitorLog } from '@/services/visitor_logs.service';
import { CURRENT_AREA_ID } from '@/constants/env.constants';
import { collectLocationMetadata } from '@/utils/location.utils';

const Tracker = () => {
    const { sessionId } = useSessionStore();
    const hasLoggedRef = useRef(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Reset the logged flag when sessionId changes
        hasLoggedRef.current = false;

        // Set a 5-second delay before logging
        timeoutRef.current = setTimeout(async () => {
            if (!hasLoggedRef.current && sessionId) {
                try {
                    // Collect location metadata
                    console.log('Collecting location metadata...');
                    const locationData = await collectLocationMetadata();

                    // Prepare base metadata
                    const metadata: Record<string, any> = {
                        ref: window.location.href,
                        userAgent: navigator.userAgent,
                        language: navigator.language,
                        screenResolution: {
                            width: window.screen.width,
                            height: window.screen.height,
                        },
                        viewport: {
                            width: window.innerWidth,
                            height: window.innerHeight,
                        },
                    };

                    // Add geolocation if available
                    if (locationData.geolocation) {
                        metadata.geolocation = {
                            latitude: locationData.geolocation.latitude,
                            longitude: locationData.geolocation.longitude,
                            accuracy: locationData.geolocation.accuracy,
                            timestamp: new Date(locationData.geolocation.timestamp).toISOString(),
                        };
                        console.log('Geolocation added to metadata');
                    } else {
                        metadata.geolocation = null;
                        console.log('Geolocation not available or permission denied');
                    }


                    await createVisitorLog({
                        session_id: sessionId,
                        area_id: CURRENT_AREA_ID,
                        visited_at: new Date(),
                        metadata: metadata
                    });
                    hasLoggedRef.current = true;
                    console.log('Visitor log created with location metadata after 5 seconds of viewing');
                } catch (error) {
                    console.error('Failed to create visitor log:', error);
                }
            }
        }, 2500); // 5 seconds delay

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [sessionId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return null;
};

export default Tracker;
