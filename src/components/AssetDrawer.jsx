import { useState, useEffect } from 'react';

const AssetDrawer = ({ isOpen, onClose, title, children }) => {
  const [ isFullyOpened, setIsFullyOpened ] = useState(isOpen); 
  const [ isRendered, setIsRendered ] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      const timer = setTimeout(() => setIsFullyOpened(true), 50);
      return () => clearTimeout(timer);
    } else {
      // Wait for the duration of the transition (300ms) before unmounting
      const timer = setTimeout(() => {
        setIsFullyOpened(false)
        setIsRendered(false)
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <div 
      className={`absolute right-0 h-full w-full overflow-hidden z-[101] pr-2
                ${isRendered ? '' : 'hidden'}`}
    >
      <div
        className={`h-full w-full rounded-lg border-purple-600 
                  bg-gray-900 border  
                  transform transition-transform duration-300 ease-in-out 
                  ${(isOpen && isFullyOpened) ? 'translate-x-0' : 'translate-x-full'}`}
        /* stopPropagation prevents clicks inside the drawer from triggering background elements */
        onClick={(e) => {
          if (isRendered) e.stopPropagation()
        }}
      >
        <div className="flex flex-col h-full bg-purple-950/30">
          
          {/* Header */}
          <div className="flex items-center p-2 border-b border-purple-600 bg-purple-900/30">
            <button 
              onClick={onClose}
              className="mr-2 p-1 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <h2 className="text-xl font-bold uppercase tracking-wider align-middle h-full">{title || 'Edit Asset'}</h2>
          </div>

          {/* Scrollable Content (Asset Editor Forms) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssetDrawer