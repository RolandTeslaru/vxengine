import React, { useRef } from 'react'


const useInit = (callback: () => void) => {
    const hasBeenInitialized = useRef(false);
    if(!hasBeenInitialized.current){
        callback();
        hasBeenInitialized.current = true;
    }
}

export default useInit
