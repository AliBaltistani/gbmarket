import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function RouteTransition({ children }) {
    const { settings } = useSettings();
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    // Initial App Boot Loader
    useEffect(() => {
        const bootTimer = setTimeout(() => {
            setIsInitialLoad(false);
        }, 1200); // 1.2s minimum lazy load

        return () => clearTimeout(bootTimer);
    }, []);

    // Internal Route Transitions
    useEffect(() => {
        // Did the location actually change?
        if (!isInitialLoad && (location.pathname !== displayLocation.pathname || location.search !== displayLocation.search)) {
            // 1. Show the loader over the current page
            setIsTransitioning(true);

            // 2. Wait long enough to allow the loader to fade in visually (and mask network latency/mounting)
            const timeoutId = setTimeout(() => {
                // Instantly snap to the top invisibly while the screen is covered
                window.scrollTo(0, 0);

                // Swap the component tree underneath to the new route
                setDisplayLocation(location);

                // Start fading out the loader
                setIsTransitioning(false);
            }, 350); // 350ms loading veil

            return () => clearTimeout(timeoutId);
        }
    }, [location, displayLocation, isInitialLoad]);

    // Show loader if it's the initial boot OR an internal transition
    const showLoader = isInitialLoad || isTransitioning;

    return (
        <>
            {/* Elegant Global Loader Overlay */}
            <div
                className={`fixed inset-0 z-[9999] bg-[#F5EFE0]/90 backdrop-blur-md flex flex-col items-center justify-center transition-opacity duration-300 pointer-events-none ${showLoader ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                <div className={`flex flex-col items-center transition-transform duration-300 ${showLoader ? 'scale-100' : 'scale-90'}`}>
                    <div className="relative flex items-center justify-center w-20 h-20 mb-4">
                        {/* Spinning Ring */}
                        <div className="absolute inset-0 border-4 border-[#E8DEC8] border-t-[#F5A623] rounded-full animate-spin"></div>

                        {/* Center Icon */}
                        <div className="w-10 h-10 rounded-full bg-[#FFFDF9] flex items-center justify-center shadow-xs text-[#D97706]">
                            <Leaf className="w-5 h-5 fill-current animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-[#3A2E1F] font-extrabold font-heading text-xl tracking-tight">{settings?.store_name || 'Store Loading...'}</h2>
                    <p className="text-[#3A2E1F]/60 text-xs font-semibold uppercase tracking-widest mt-1 animate-pulse">
                        {isInitialLoad ? "Initializing Store..." : "Loading Fresh Goods..."}
                    </p>
                </div>
            </div>

            {/* The Actual Content (using cloned location to trick Routes) */}
            <div className={`transition-opacity duration-300 ${showLoader ? 'opacity-0 blur-sm pointer-events-none' : 'opacity-100 blur-0'}`}>
                {/* Clone the Routes block and inject the lagged location */}
                {React.cloneElement(children, { location: displayLocation })}
            </div>
        </>
    );
}
