/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   use3DVistaHook.ts                                  :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: deno <tctoan1024@gmail.com>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/01 11:42:05 by deno              #+#    #+#             */
/*   Updated: 2025/05/01 11:42:05 by deno             ###   ########.fr       */
/*   ************************************************************************** */

import { useRef, useEffect } from "react";
import type { RefObject } from "react";

// Type definitions for 3DVista tour object
interface Tour {
  setMediaByName: (mediaName: string) => void;
}

interface ContentWindow extends Window {
  tour?: Tour;
}

interface IFrameElement extends HTMLIFrameElement {
  contentWindow: ContentWindow | null;
}

// Type for event handlers registry
type EventCallback = (payload?: any) => void;
type EventHandlers = Record<string, EventCallback[]>;

// Type for message event data
interface MessageEventData {
  type: string;
  payload?: any;
}

// Hook parameters interface
interface Use3DVistaHookParams {
  ref: RefObject<IFrameElement>;
  onReadyHandler?: EventCallback;
}

// Hook return type interface
interface Use3DVistaHookReturn {
  showMedia: (mediaName: string) => void;
  sendMessage: (message: any) => void;
  onMessage: (eventType: string, callback: EventCallback) => void;
  muteAllAudio: () => void;
  unmuteAllAudio: () => void;
  stopAllAudio: () => void;
  getAudioState: () => Promise<any>;
}

const use3DVistaHook = ({
  ref,
  onReadyHandler = () => {
    console.log("3DVista is ready");
  },
}: Use3DVistaHookParams): Use3DVistaHookReturn => {
  const parentWindow: Window = window.parent;
  const eventHandlers = useRef<EventHandlers>({
    ready: [onReadyHandler],
  });

  const showMedia = (mediaName: string): void => {
    ref.current?.contentWindow?.tour?.setMediaByName(mediaName);
  };

  const sendMessage = (message: any): void => {
    parentWindow?.postMessage(message, "*");
  };

  const registerMessageHandler = (
    eventType: string,
    callback: EventCallback
  ): void => {
    if (!eventHandlers.current[eventType]) {
      eventHandlers.current[eventType] = [];
    }
    const exists = eventHandlers.current[eventType].includes(callback);
    if (!exists) {
      eventHandlers.current[eventType].push(callback);
    }
  };

  // Audio control functions
  const muteAllAudio = (): void => {
    if (ref.current?.contentWindow) {
      ref.current.contentWindow.postMessage(
        {
          type: "audio_control_command",
          payload: { action: "mute" },
        },
        "*"
      );
    }
  };

  const unmuteAllAudio = (): void => {
    if (ref.current?.contentWindow) {
      ref.current.contentWindow.postMessage(
        {
          type: "audio_control_command",
          payload: { action: "unmute" },
        },
        "*"
      );
    }
  };

  const stopAllAudio = (): void => {
    if (ref.current?.contentWindow) {
      ref.current.contentWindow.postMessage(
        {
          type: "audio_control_command",
          payload: { action: "stop" },
        },
        "*"
      );
    }
  };

  const getAudioState = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!ref.current?.contentWindow) {
        reject(new Error("iFrame not ready"));
        return;
      }

      // Set up a one-time listener for the response
      const responseHandler = (event: MessageEvent) => {
        if (event.data?.type === "audio_state_response") {
          window.removeEventListener("message", responseHandler);
          resolve(event.data.payload);
        }
      };

      // Add timeout to avoid hanging promises
      const timeout = setTimeout(() => {
        window.removeEventListener("message", responseHandler);
        reject(new Error("Audio state request timeout"));
      }, 5000);

      window.addEventListener("message", responseHandler);

      // Clear timeout when response is received
      const originalResolve = resolve;
      resolve = (value: any) => {
        clearTimeout(timeout);
        originalResolve(value);
      };

      // Send the request
      ref.current.contentWindow.postMessage(
        {
          type: "audio_control_command",
          payload: { action: "get_state" },
        },
        "*"
      );
    });
  };

  useEffect(() => {
    const messageHandler = (event: MessageEvent<MessageEventData>): void => {
      // alert('Received message from parent: ' + JSON.stringify(event.data));
      if (event.source !== parentWindow) return;

      const { type, payload } = event.data;
      const callbacks = eventHandlers.current[type];

      if (Array.isArray(callbacks)) {
        callbacks.forEach((cb: EventCallback) => cb(payload));
      }
    };

    window.addEventListener("message", messageHandler);
    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, [parentWindow]);

  return {
    showMedia,
    sendMessage,
    onMessage: registerMessageHandler,
    muteAllAudio,
    unmuteAllAudio,
    stopAllAudio,
    getAudioState,
  };
};

export default use3DVistaHook;
