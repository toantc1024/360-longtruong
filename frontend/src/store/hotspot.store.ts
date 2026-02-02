// import { create } from "zustand";
// import {
//   getAllHotspots,
//   searchHotspotsByTitle,
//   getHotspotById,
//   createHotspot,
// } from "../services/hotspots.service";

// const useHotspotStore = create((set, get) => ({
//   allHotspots: [], // This will store the original list
//   hotspots: [], // This will store the filtered list
//   loading: false,
//   error: null,
//   // Initialize/fetch all hotspots
//   fetchHotspots: async () => {
//     // Don't refetch if already loaded and not empty
//     if (get().loading || get().allHotspots.length > 0) return get().allHotspots;

//     try {
//       set({ loading: true, error: null });
//       const data = await getAllHotspots();
//       set({
//         allHotspots: data,
//         hotspots: data,
//         loading: false,
//       });
//       return data; // Return data to allow component to know when fetch is complete
//     } catch (error) {
//       set({
//         error: error?.message || "Error fetching hotspots",
//         loading: false,
//       });
//       return []; // Return empty array in case of error
//     }
//   },

//   setHotspots: (hotspots) => set({ allHotspots: hotspots, hotspots }),
//   hTitle: "",
//   setSearchTitle: (hTitle) => set({ hTitle }),
//   // Search hotspots using the API service
//   searchHotspots: async (searchTitle) => {
//     // Don't search if already loading
//     if (get().loading) return;

//     try {
//       set({ loading: true, error: null });
//       if (!searchTitle.trim()) {
//         // If search is empty, load all hotspots
//         const data = await getAllHotspots();
//         set({
//           hotspots: data,
//           loading: false,
//         });
//       } else {
//         // Search by title using the service
//         const data = await searchHotspotsByTitle(searchTitle);
//         set({
//           hotspots: data,
//           loading: false,
//         });
//       }
//     } catch (error) {
//       set({
//         error: error?.message || "Error searching hotspots",
//         loading: false,
//       });
//     }
//   },
//   clearSearch: async () => {
//     // Don't clear if already loading
//     if (get().loading) return;

//     set({ searchTitle: "" });
//     try {
//       set({ loading: true, error: null });
//       const data = await getAllHotspots();
//       set({
//         hotspots: data,
//         loading: false,
//       });
//     } catch (error) {
//       set({
//         error: error?.message || "Error clearing search",
//         loading: false,
//       });
//     }
//   },
//   setCurrentHotspot: (currentHotspot) => set({ currentHotspot }),
//   currentHotspot: null,
//   setCurrentHotspotById: (id) => {
//     set((state) => ({
//       currentHotspot: state.hotspots.find((hotspot) => hotspot.id === id),
//     }));
//   },

//   // Add a new hotspot
//   addHotspot: async (hotspotData) => {
//     try {
//       set({ loading: true, error: null });
//       const newHotspot = await createHotspot(hotspotData);

//       // Update the state with the new hotspot
//       set((state) => ({
//         allHotspots: [...state.allHotspots, newHotspot],
//         hotspots: [...state.hotspots, newHotspot],
//         loading: false,
//       }));

//       return newHotspot;
//     } catch (error) {
//       set({
//         error: error?.message || "Error creating hotspot",
//         loading: false,
//       });
//       throw error;
//     }
//   },
// }));

// export default useHotspotStore;
