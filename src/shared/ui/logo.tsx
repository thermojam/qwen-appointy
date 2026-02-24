'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export function Logo() {
  const { theme } = useTheme();
  const [isDark, setIsDark] = useState(false);

  // Ждём пока тема загрузится на клиенте
  useEffect(() => {
    setIsDark(theme === 'dark');
  }, [theme]);

  // Во время SSR используем дефолтный цвет (светлая тема)
  const strokeColor = isDark ? '#E1E1E1' : '#1A1A1A';

  return (
    <div className="flex items-center text-foreground">
      <svg
        width="42"
        height="52"
        viewBox="0 0 42 52"
        fill="none"
        aria-hidden
      >
        <path
          d="M27.6686 24.8646C27.6686 24.8646 41.5009 35.3928 31.961 50.5415L15.8081 7.09267"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M8.23283 0.512015C3.96002 0.514103 0.497912 3.97957 0.500001 8.25238C0.502089 12.5252 3.96758 15.9873 8.2404 15.9852C12.5132 15.9832 15.9753 12.5176 15.9733 8.24482C15.9712 3.972 12.5057 0.509926 8.23283 0.512015Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M13.183 24.8717C13.183 24.8717 -0.638942 35.4135 8.91578 50.5528L25.0262 7.08818"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M32.7596 0.500006C28.4868 0.502094 25.0247 3.96756 25.0268 8.24038C25.0289 12.5132 28.4944 15.9753 32.7672 15.9732C37.04 15.9711 40.5021 12.5056 40.5 8.23281C40.4979 3.96 37.0325 0.497917 32.7596 0.500006Z"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="text-[20px] leading-none font-semibold">ppointy</span>
    </div>
  );
}
