"use client";

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export function ThemeSync() {
    const theme = useThemeStore((state) => state.theme);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return null;
}
