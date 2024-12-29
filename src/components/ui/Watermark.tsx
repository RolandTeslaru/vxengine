import React from 'react'

const Watermark = () => {
    return (
        <a
            className="fixed pointer-events-auto bottom-6 box-border flex gap-2 left-10 opacity-20"
            href="https://vexr-labs.com/"
            target="_blank"
        >
            <svg className='w-12' id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 653.95 440.33">
                <polygon className='fill-white' points="653.95 0 617.64 62.9 617.52 63.09 616.17 65.43 581.31 125.81 218.13 125.81 238.74 90.11 254.34 63.09 254.44 62.9 290.65 .19 290.77 0 435.81 0 435.93 .19 436.03 0 508.45 0 508.56 .19 508.67 0 581.1 0 581.21 .19 581.31 0 653.95 0" />
                <path className='fill-white' d="M544.89,188.9l-.12-.19h-145.05l-.12.19-35.06,60.72v4.37l-1.26-2.18-36.21,62.71-.1.19-25.32,43.86-10.9,18.86-.1.17-36.21,62.72h145.28l27.74-48.05,8.47-14.66-.12-.19h.22l36.21-62.71h0s-.1-.2-.1-.2h.22l18-31.18,18.21-31.53-.1-.19h.22l36.21-62.72ZM363.3,377.62l-.12-.19h.22l-.1.19Z" />
                <polygon className='fill-white' points="326.86 314.52 181.59 314.52 175.84 304.57 145.38 251.81 145.27 251.62 112.92 195.6 109.06 188.91 108.94 188.71 72.74 126 72.63 125.81 50.03 86.65 36.43 63.1 36.31 62.9 .1 .19 0 0 145.27 0 145.38 .19 175.84 52.95 181.58 62.9 181.71 63.1 217.9 125.81 218.02 126 238.74 161.89 254.22 188.71 254.33 188.9 254.33 188.91 290.55 251.62 290.65 251.81 301.65 270.86 326.86 314.52" />
            </svg>
            <h1 className="font-inter font-bold text-3xl text-white align-text-bottom">
                VEXR<span className="font-thin">LABS</span>
            </h1>
        </a>
    )
}

export default Watermark
