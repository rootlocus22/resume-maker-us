"use client";

import React from 'react';

export default function ScrollToTopButton() {
    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-yellow-400 text-[#0B1F3B] font-bold py-3 px-8 rounded-full hover:bg-yellow-300 transition duration-300"
        >
            Check Score Free
        </button>
    );
}
