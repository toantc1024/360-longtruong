/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   bridge.js                                          :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: deno <tctoan1024@gmail.com>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2025/05/01 10:16:12 by deno              #+#    #+#             */
/*   Updated: 2025/05/01 10:16:12 by deno             ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

// Simplified bridge - only for panorama change detection
class VRTourBridge {
  constructor() {
    this.isInitialized = false;
    this.tour = null;
    this.currentPanorama = null;
    this.lastNotifiedPanoramaId = null; // Track last notified panorama
    this.debounceTimeout = null; // For debouncing

    // Wait for tour to be initialized
    this.waitForTour();
  }

  waitForTour() {
    const checkTour = () => {
      if (window.tour && window.tour.player) {
        this.tour = window.tour;
        // Wait a bit more for tour to be fully initialized
        setTimeout(() => {
          this.initialize();
        }, 500);
      } else {
        setTimeout(checkTour, 100);
      }
    };
    checkTour();
  }

  initialize() {
    if (this.isInitialized) return;

    console.log("VR Tour Bridge initialized");
    this.isInitialized = true;

    // Multiple approaches to detect when tour is ready
    if (this.tour && this.tour.bind && window.TDV && window.TDV.Tour) {
      this.tour.bind(window.TDV.Tour.EVENT_TOUR_LOADED, () => {
        console.log("Tour fully loaded via EVENT_TOUR_LOADED");
        setTimeout(() => {
          this.setupPanoramaChangeListeners();
        }, 100);
      });
    }

    // Also try direct setup after delay
    setTimeout(() => {
      console.log("Attempting direct setup after 2 seconds");
      this.setupPanoramaChangeListeners();
    }, 2000);

    // Alternative approach: poll for tour readiness
    this.pollForTourReady();
  }

  pollForTourReady() {
    let attempts = 0;
    const maxAttempts = 20;

    const checkReady = () => {
      attempts++;
      console.log(`Polling attempt ${attempts}/${maxAttempts}`);

      if (this.tour && this.tour.player) {
        const rootPlayer = this.tour.player.getById("rootPlayer");
        if (rootPlayer) {
          console.log("Tour appears ready via polling");
          this.setupPanoramaChangeListeners();
          return;
        }
      }

      if (attempts < maxAttempts) {
        setTimeout(checkReady, 500);
      } else {
        console.log("Max polling attempts reached");
      }
    };

    setTimeout(checkReady, 1000);
  }

  handlePanoramaChange(event) {
    const playlist = event.source;
    const selectedIndex = playlist.get("selectedIndex");

    if (selectedIndex >= 0) {
      const items = playlist.get("items");
      const currentItem = items[selectedIndex];
      const media = currentItem.get("media");

      const panoramaInfo = {
        id: media.get("id"),
        class: media.get("class"),
        data: media.get("data"),
        label: media.get("data") ? media.get("data").label : null,
        selectedIndex: selectedIndex,
        totalItems: items.length,
        source: "playlistChange",
      };

      this.debouncedNotifyPanoramaChange(panoramaInfo);
    }
  }

  trackCurrentPanoramaFromMedia(event) {
    try {
      const media = event.source;
      if (
        media &&
        media.get &&
        media.get("class") &&
        media.get("class").indexOf("Panorama") !== -1
      ) {
        const panoramaInfo = {
          id: media.get("id"),
          class: media.get("class"),
          data: media.get("data"),
          label: media.get("data") ? media.get("data").label : null,
          source: "mediaShow",
        };

        this.debouncedNotifyPanoramaChange(panoramaInfo);
      }
    } catch (error) {
      console.error("Error tracking panorama from media:", error);
    }
  }

  startPeriodicCheck() {
    setInterval(() => {
      try {
        const rootPlayer = this.tour.player.getById("rootPlayer");
        if (rootPlayer) {
          const mainViewer = rootPlayer.getMainViewer();
          const activeMedia = rootPlayer.getActiveMediaWithViewer(mainViewer);

          if (activeMedia) {
            const currentId = activeMedia.get("id");

            const panoramaInfo = {
              id: currentId,
              class: activeMedia.get("class"),
              data: activeMedia.get("data"),
              label: activeMedia.get("data")
                ? activeMedia.get("data").label
                : null,
              source: "periodicCheck",
            };

            this.debouncedNotifyPanoramaChange(panoramaInfo);
          }
        }
      } catch (error) {
        // Silent fail for periodic check
      }
    }, 2000); // Increased to 2 seconds to reduce frequency
  }

  debouncedNotifyPanoramaChange(panoramaInfo) {
    // Only notify if the panorama ID has actually changed
    if (this.lastNotifiedPanoramaId === panoramaInfo.id) {
      return; // Same panorama, don't notify again
    }

    // Clear any existing timeout
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    // Set a new timeout to debounce rapid changes
    this.debounceTimeout = setTimeout(() => {
      this.notifyPanoramaChange(panoramaInfo);
      this.lastNotifiedPanoramaId = panoramaInfo.id;
    }, 300); // 300ms debounce
  }

  setupPanoramaChangeListeners() {
    if (!this.tour || !this.tour.player) {
      console.log("Tour or player not ready");
      return;
    }

    try {
      const rootPlayer = this.tour.player.getById("rootPlayer");
      if (!rootPlayer) {
        console.log("Root player not found, retrying in 500ms");
        setTimeout(() => {
          this.setupPanoramaChangeListeners();
        }, 500);
        return;
      }

      console.log("Setting up panorama change listeners");

      // Method 1: Listen to main playlist changes
      const mainPlaylist = rootPlayer.mainPlayList;
      if (mainPlaylist) {
        mainPlaylist.bind("change", (event) => {
          console.log("Main playlist change detected");
          this.handlePanoramaChange(event);
        });
        console.log("Main playlist listener added");
      }

      // Method 2: Listen to all playlists
      const playlists = rootPlayer.getByClassName("PlayList");
      if (playlists && playlists.length > 0) {
        playlists.forEach((playlist, index) => {
          playlist.bind("change", (event) => {
            console.log(`Playlist ${index} change detected`);
            this.handlePanoramaChange(event);
          });
        });
        console.log(`Added listeners to ${playlists.length} playlists`);
      }

      // Method 3: Listen for media show events
      rootPlayer.bind("mediaShow", (event) => {
        console.log("Media show event detected");
        setTimeout(() => {
          this.trackCurrentPanoramaFromMedia(event);
        }, 100);
      });

      // Method 4: Set up periodic checking
      this.startPeriodicCheck();

      // Notify parent window that bridge is ready
      window.parent.postMessage(
        {
          type: "bridge_ready",
          payload: { message: "Bridge initialized and listeners set up" },
        },
        "*"
      );
    } catch (error) {
      console.error("Error setting up panorama listeners:", error);
      // Retry after delay
      setTimeout(() => {
        this.setupPanoramaChangeListeners();
      }, 1000);
    }
  }

  notifyPanoramaChange(panoramaInfo) {
    this.currentPanorama = panoramaInfo;

    // Send message to parent window
    window.parent.postMessage(
      {
        type: "panorama_change",
        payload: panoramaInfo,
      },
      "*"
    );

    // Also show in console for debugging
    const label = panoramaInfo.label || panoramaInfo.id || "Unknown panorama";
    console.log(
      `Panorama changed to: ${label} (via ${panoramaInfo.source || "unknown"})`
    );
  }

  // Audio Control Functions
  muteAllAudio() {
    try {
      if (!this.tour || !this.tour.player) {
        console.warn("Tour not ready for audio control");
        return false;
      }

      const rootPlayer = this.tour.player.getById("rootPlayer");
      if (rootPlayer && rootPlayer.stopGlobalAudios) {
        rootPlayer.stopGlobalAudios();
        console.log("All audio muted");

        // Notify parent window
        window.parent.postMessage(
          {
            type: "audio_control",
            payload: { action: "muted", success: true },
          },
          "*"
        );
        return true;
      } else {
        console.error("stopGlobalAudios method not available");
        return false;
      }
    } catch (error) {
      console.error("Error muting audio:", error);

      // Notify parent window of error
      window.parent.postMessage(
        {
          type: "audio_control",
          payload: { action: "mute_error", error: error.message },
        },
        "*"
      );
      return false;
    }
  }

  unmuteAllAudio() {
    try {
      if (!this.tour || !this.tour.player) {
        console.warn("Tour not ready for audio control");
        return false;
      }

      const rootPlayer = this.tour.player.getById("rootPlayer");
      if (rootPlayer && rootPlayer.resumeGlobalAudios) {
        rootPlayer.resumeGlobalAudios();
        console.log("All audio unmuted");

        // Notify parent window
        window.parent.postMessage(
          {
            type: "audio_control",
            payload: { action: "unmuted", success: true },
          },
          "*"
        );
        return true;
      } else {
        console.error("resumeGlobalAudios method not available");
        return false;
      }
    } catch (error) {
      console.error("Error unmuting audio:", error);

      // Notify parent window of error
      window.parent.postMessage(
        {
          type: "audio_control",
          payload: { action: "unmute_error", error: error.message },
        },
        "*"
      );
      return false;
    }
  }

  // Additional method to stop all audio (stronger than pause)
  stopAllAudio() {
    try {
      if (!this.tour || !this.tour.player) {
        console.warn("Tour not ready for audio control");
        return false;
      }

      const rootPlayer = this.tour.player.getById("rootPlayer");
      if (rootPlayer && rootPlayer.stopGlobalAudios) {
        rootPlayer.stopGlobalAudios();
        console.log("All audio stopped");

        // Notify parent window
        window.parent.postMessage(
          {
            type: "audio_control",
            payload: { action: "stopped", success: true },
          },
          "*"
        );
        return true;
      } else {
        console.error("stopGlobalAudios method not available");
        return false;
      }
    } catch (error) {
      console.error("Error stopping audio:", error);

      // Notify parent window of error
      window.parent.postMessage(
        {
          type: "audio_control",
          payload: { action: "stop_error", error: error.message },
        },
        "*"
      );
      return false;
    }
  }

  // Get current audio state
  getAudioState() {
    try {
      if (!this.tour || !this.tour.player) {
        return { available: false, error: "Tour not ready" };
      }

      const rootPlayer = this.tour.player.getById("rootPlayer");
      if (rootPlayer) {
        // Check if there are any global audios currently playing
        const hasCurrentAudios =
          window.currentGlobalAudios &&
          Object.keys(window.currentGlobalAudios).length > 0;

        const hasPausedAudios =
          window.pausedAudiosLIFO && window.pausedAudiosLIFO.length > 0;

        return {
          available: true,
          hasCurrentAudios,
          hasPausedAudios,
          methods: {
            pauseGlobalAudios:
              typeof rootPlayer.pauseGlobalAudios === "function",
            resumeGlobalAudios:
              typeof rootPlayer.resumeGlobalAudios === "function",
            stopGlobalAudios: typeof rootPlayer.stopGlobalAudios === "function",
          },
        };
      }

      return { available: false, error: "Root player not found" };
    } catch (error) {
      return { available: false, error: error.message };
    }
  }
}

// Initialize the bridge
window.vrTourBridge = new VRTourBridge();

// Listen for audio control messages from parent window
window.addEventListener("message", function (event) {
  if (event.data && event.data.type === "audio_control_command") {
    const { action } = event.data.payload || {};

    switch (action) {
      case "mute":
        window.vrTourBridge.muteAllAudio();
        break;
      case "unmute":
        window.vrTourBridge.unmuteAllAudio();
        break;
      case "stop":
        window.vrTourBridge.stopAllAudio();
        break;
      case "get_state":
        const state = window.vrTourBridge.getAudioState();
        window.parent.postMessage(
          {
            type: "audio_state_response",
            payload: state,
          },
          "*"
        );
        break;
      default:
        console.warn("Unknown audio control action:", action);
    }
  }
});

window.addEventListener("DOMContentLoaded", function () {
  console.log("3DVista Bridge is ready");
});
