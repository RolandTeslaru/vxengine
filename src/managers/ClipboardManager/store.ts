import { enableMapSet, produce } from "immer";
import { create } from "zustand";

enableMapSet();

export type ClipboardType = 'number' | 'keyframes' | 'color' | 'other';

interface ClipboardManagerState {
    items: Map<ClipboardType, any>;
    addItem: <T>(type: ClipboardType, item: any) => void;
    clear: (type?: ClipboardType) => void;
    getItemByType: <T>(type: ClipboardType) => any;
}

export const useClipboardManagerAPI = create<ClipboardManagerState>((set, get) => ({
    // Initialize with an empty Map
    items: new Map<ClipboardType, any>(),
    addItem: (type, item) =>
      set(
        produce((state: ClipboardManagerState) => {
          // Get the current array for the type (or initialize an empty array)
          state.items.set(type, item);
        })
      ),
    clear: (type) =>
      set(
        produce((state: ClipboardManagerState) => {
          if (type) {
            // Clear only items for the specified type
            state.items.delete(type);
          } else {
            // Clear all items by reinitializing the Map
            state.items = new Map<ClipboardType, any>();
          }
        })
      ),
    getItemByType: (type) => {
      return get().items.get(type)
    },
  }));

