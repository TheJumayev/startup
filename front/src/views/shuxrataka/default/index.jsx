import React, { useState, useEffect } from 'react';

const WelcomeAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const fullText = "Registrator ofisga xush kelibsiz!";

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isVisible) {
      if (textIndex < fullText.length) {
        const timer = setTimeout(() => {
          setDisplayText(fullText.substring(0, textIndex + 1));
          setTextIndex(textIndex + 1);
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [isVisible, textIndex, fullText]);

  return (
    <div className="min-h-screen  p-4 md:p-6 flex items-center justify-center">
      <div className="mx-auto max-w-6xl w-full">
        <div className="text-center">
          {/* Asosiy konteyner animatsiyasi */}
          <div className={`
            transition-all duration-1000 ease-in-out
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
          `}>


            {/* Asosiy matn animatsiyasi */}
            <h1 className="
              min-h-[120px] md:min-h-[140px]
              flex justify-center items-center
              text-3xl md:text-5xl lg:text-6xl
              font-bold text-indigo-800 mb-4
              px-4
            ">
              {displayText}
              <span className="
                text-indigo-600
                animate-blink
              ">|</span>
            </h1>

            {/* Ism animatsiyasi */}
            <p className={`
              text-lg md:text-7xl text-indigo-600 mt-8
              transition-all duration-1000 delay-1000
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              Barotov Shuxrat
            </p>

            {/* Dekorativ chiziq animatsiyasi */}
            <div className={`
              h-1 w-0 mx-auto mt-12
              bg-gradient-to-r from-transparent via-indigo-600 to-transparent
              transition-all duration-2000 delay-500
              ${isVisible ? 'w-24 md:w-32 opacity-100' : 'opacity-0'}
            `}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAnimation;