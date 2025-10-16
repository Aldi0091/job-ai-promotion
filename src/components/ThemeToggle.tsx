import * as React from "react";
import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";


export const useThemeToggle = () => {
    const [mode, setMode] = React.useState<"light" | "dark">(
        (localStorage.getItem("theme-mode") as any) || "dark"
    );
    const toggle = React.useCallback(() => {
        setMode((m) => {
            const next = m === "light" ? "dark" : "light";
            localStorage.setItem("theme-mode", next);
            return next;
        });
    }, []);
    return { mode, toggle };
};


export const ThemeToggle = ({ mode, onClick }: { mode: "light" | "dark"; onClick: () => void }) => (
    <Tooltip title={mode === "dark" ? "Светлая тема" : "Тёмная тема"}>
        <IconButton onClick={onClick} size="small">
            {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
    </Tooltip>
);