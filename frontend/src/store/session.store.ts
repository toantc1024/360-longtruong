// stores/sessionStore.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface SessionState {
    sessionId: string;
    createdAt: number;
    resetSession: () => void;
}

interface SessionData {
    sessionId: string;
    createdAt: number;
}

const SESSION_STORAGE_KEY = 'bandoso-session';
const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

const getStoredSession = (): SessionData | null => {
    try {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!stored) return null;

        const sessionData: SessionData = JSON.parse(stored);
        const now = Date.now();

        // Check if session has expired (30 minutes)
        if (now - sessionData.createdAt > SESSION_DURATION) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return null;
        }

        return sessionData;
    } catch (error) {
        console.error('Error reading session from localStorage:', error);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
    }
};

const createNewSession = (): SessionData => {
    const sessionData: SessionData = {
        sessionId: uuidv4(),
        createdAt: Date.now(),
    };

    try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    } catch (error) {
        console.error('Error saving session to localStorage:', error);
    }

    return sessionData;
};

const getOrCreateSession = (): SessionData => {
    const storedSession = getStoredSession();
    return storedSession || createNewSession();
};

export const useSessionStore = create<SessionState>((set) => {
    const initialSession = getOrCreateSession();

    return {
        sessionId: initialSession.sessionId,
        createdAt: initialSession.createdAt,
        resetSession: () => {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            const newSession = createNewSession();
            set({
                sessionId: newSession.sessionId,
                createdAt: newSession.createdAt,
            });
        },
    };
});