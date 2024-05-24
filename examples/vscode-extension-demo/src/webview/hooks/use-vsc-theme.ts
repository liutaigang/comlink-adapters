import { useState, useEffect } from 'react';
import { useRemote } from './use-remote';
import { proxy } from 'comlink';

export const vscColorThemeOptions = [
    {
        label: 'Light High Contrast',
        value: 'Default High Contrast Light',
    },
    {
        label: 'Light (Visual Studio)',
        value: 'Visual Studio Light',
    },
    {
        label: 'Light Modern',
        value: 'Default Light Modern',
    },
    {
        label: 'Light+',
        value: 'Default Light+',
    },
    {
        label: 'Dark High Contrast',
        value: 'Default High Contrast',
    },
    {
        label: 'Dark (Visual Studio)',
        value: 'Visual Studio Dark',
    },
    {
        label: 'Dark Modern',
        value: 'Default Dark Modern',
    },
    {
        label: 'Dark+',
        value: 'Default Dark+',
    },
    {
        label: 'Red',
        value: 'Red',
    },
];

export function useVscTheme() {
    const remote = useRemote();
    const [theme, setTheme] = useState<string>();

    useEffect(() => {
        const next = (theme: string) => {
            console.log('=========================================================theme changed:', theme);
            setTheme(theme);
        };
        remote.onThemeChange(proxy(next));
    }, []);

    const updateTheme = async (theme: string) => {
        await remote.setTheme(theme);
        setTheme(theme);
    };

    return [theme, updateTheme] as [string, typeof updateTheme];
}
