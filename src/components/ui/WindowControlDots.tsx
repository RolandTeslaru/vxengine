import React, { use } from "react"
import { Popover, PopoverContent, PopoverItem, PopoverTrigger } from "../shadcn/popover"
import { useUIManagerAPI } from "@vxengine/managers/UIManager/store"
import { useWindowContext } from "@vxengine/core/components/VXEngineWindow"

interface Props {
    isAttached: boolean
}

export const WindowControlDots: React.FC<Props> = ({ isAttached }) => {
    const { vxWindowId } = useWindowContext()
    
    const handleAttachChange = () => {
        const state = useUIManagerAPI.getState();
        if(isAttached)
            state.detachVXWindow(vxWindowId);
        else
            state.attachVXWindow(vxWindowId);
    } 

    const handleCloseWindow = () => {
        const state = useUIManagerAPI.getState();
        state.closeVXWindow(vxWindowId);
    }

    const theme = useUIManagerAPI(state => state.theme)
    
    return (
        <div className="absolute top-0 left-1/2 -translate-x-1/2">
            <Popover>
                <PopoverTrigger disableStyling={true}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-row gap-1 p-1 cursor-pointer rounded-full 
                         hover:bg-neutral-300/20
                        data-[state=open]:bg-bg-neutral-300/40 ease-in-out overflow-visible"
                    >
                        <span
                            className="content-[' '] rounded-full bg-neutral-200/30 w-1 h-1 block"
                        >
                        </span>
                        <span
                            className="content-[' '] rounded-full bg-neutral-200/30 w-1 h-1 block"
                        >
                        </span>
                        <span
                            className="content-[' '] rounded-full bg-neutral-200/30 w-1 h-1 block"
                        >
                        </span>
                    </div>
                </PopoverTrigger>
                <PopoverContent sideOffset={-2} className="w-40 p-1 text-sm font-roboto-mono "
                >
                    <PopoverItem
                        onClick={handleAttachChange}
                        icon=
                        {isAttached
                            ? <svg className="h-auto my-auto mr-2" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path></svg>
                            : <svg className='h-auto my-auto mr-2 rotate-180' width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 13C12.5523 13 13 12.5523 13 12V3C13 2.44771 12.5523 2 12 2H3C2.44771 2 2 2.44771 2 3V6.5C2 6.77614 2.22386 7 2.5 7C2.77614 7 3 6.77614 3 6.5V3H12V12H8.5C8.22386 12 8 12.2239 8 12.5C8 12.7761 8.22386 13 8.5 13H12ZM9 6.5C9 6.5001 9 6.50021 9 6.50031V6.50035V9.5C9 9.77614 8.77614 10 8.5 10C8.22386 10 8 9.77614 8 9.5V7.70711L2.85355 12.8536C2.65829 13.0488 2.34171 13.0488 2.14645 12.8536C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L7.29289 7H5.5C5.22386 7 5 6.77614 5 6.5C5 6.22386 5.22386 6 5.5 6H8.5C8.56779 6 8.63244 6.01349 8.69139 6.03794C8.74949 6.06198 8.80398 6.09744 8.85143 6.14433C8.94251 6.23434 8.9992 6.35909 8.99999 6.49708L8.99999 6.49738" fill="currentColor"></path></svg>
                        }
                        className="rounded-lg!"
                    >
                        <p className={theme === "dark" ? "text-neutral-100" : "text-neutral-700"}>
                            {isAttached ? "Detach" : "Attach"}
                        </p>
                    </PopoverItem>
                    <PopoverItem
                        className="text-red-600 text-sm rounded-lg!"
                        onClick={handleCloseWindow}
                        variant="destructive"
                        icon={
                            <svg className="h-auto my-auto mr-2 scale-125" width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                        }
                    >
                        Close
                    </PopoverItem>
                </PopoverContent>

            </Popover>
        </div>
    )
}