import React from 'react'

interface Props {
    searchQuery: string;
    setSearchQuery: (query) => void;
    className?: string
    inputClassName?: string
}

const Search:React.FC<Props> = (props) => {
    const {searchQuery, setSearchQuery, className, inputClassName} = props
    return (
        <div 
            className={'flex flex-row gap-1 h-[16px] px-1 bg-secondary-opaque w-24 border dark:border-neutral-700/40 border-neutral-400/40 rounded-full' + " " + className} 
        >
            <input
                className={`h-full py-[1px] w-full text-neutral-400 bg-transparent
                            placeholder-neutral-400 font-medium focus:outline-hidden` + " " + inputClassName}
                type="text"
                placeholder='search'
                style={{ fontSize: "10px" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </div>
    )
}

export default Search
