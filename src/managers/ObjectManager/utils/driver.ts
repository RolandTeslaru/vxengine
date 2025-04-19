import { vxObjectProps } from "../types/objectStore";

export const dispatchVirtualEntityChangeEvent = (e: any, vxobject: vxObjectProps) => {
    const virtualEntityChangeEvent = new CustomEvent('virtualEntityChange', {
      detail: { transformation: e, object: vxobject }
    });
  
    document.dispatchEvent(virtualEntityChangeEvent as any);
  }