import { useTheme } from "./theme-provider"
import { RiMoonLine, RiSunLine } from '@remixicon/react'

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark")
    }
    
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={`Mudar para modo ${theme === "dark" ? "claro" : "escuro"}`}
        >
            {theme === "dark" ? (
                <RiMoonLine className="h-5 w-5 text-blue-600" />
            ) : (
                <RiSunLine className="h-5 w-5 text-yellow-500" />
            )}
        </button>
    )
}