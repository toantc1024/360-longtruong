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
}

// Initialize the bridge
window.vrTourBridge = new VRTourBridge();

window.addEventListener("DOMContentLoaded", function () {
  // Step 1: Find the "Enable audio?" span by content
  function findEnableAudioSpan() {
    const elements = document.querySelectorAll("span");
    for (const el of elements) {
      const normalizedText = el.textContent.replace(/\s+/g, " ").trim();
      if (normalizedText === "Enable audio?") {
        return el;
      }
    }
    return null;
  }

  // Step 2: Get the target span and navigate to root
  const target = findEnableAudioSpan();
  console.log("Step 1: Found Enable audio span element");

  let root =
    target.parentElement.parentElement.parentElement.parentElement.parentElement
      .parentElement;
  console.log("Step 2: Found root element");

  // Step 3: Find all buttons with tdvClass="Button"
  const buttons = root.querySelectorAll('div[tdvclass="Button"]');
  console.log("Step 3: Found buttons:", buttons.length);

  // Step 4: Look for YES button and click it
  for (const btn of buttons) {
    const text = btn.textContent.replace(/\s+/g, " ").trim();
    console.log(`Button text: "${text}"`);
    if (text === "YES") {
      console.log("Step 4: Found YES button, clicking it");
      btn.click();
      break;
    }
  }
  console.log("3DVista Bridge is ready");
});
