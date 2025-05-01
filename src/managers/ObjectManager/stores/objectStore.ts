// VXEngine - VEXR Labs' proprietary toolset for React Three Fiber
// (c) 2024 VEXR Labs. All Rights Reserqved.
// See the LICENSE file in the root directory of this source tree for licensing information.

import { create } from 'zustand';
import { vxObjectProps, ObjectStoreStateProps } from '../types/objectStore';
import { useObjectManagerAPI } from './managerStore';
import { vxengine } from '@vxengine/singleton';

export const useVXObjectStore = create<ObjectStoreStateProps>((set, get) => ({
    objects: {}
}));

interface AddObjectProps {
    icon?: any; // Consider using a more specific type if available
    modifyObjectTree?: boolean;
}
