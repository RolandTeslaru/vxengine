import React from 'react'

const Watermark = () => {
    return (
        <a
            className="fixed pointer-events-auto bottom-5 left-10"
            href="https://vexr-labs.com/"
            target="_blank"
        >
            <h1 className="font-inter font-bold text-3xl text-white text-opacity-20">
                VEXR<span className="font-thin">LABS</span>
            </h1>
        </a>
    )
}

export default Watermark
