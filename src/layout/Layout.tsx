import * as React from "react";
import { Layout as RaLayout, AppBar, TitlePortal } from "react-admin";
import { CssBaseline, ThemeProvider, createTheme, Box } from "@mui/material";
import { ThemeToggle, useThemeToggle } from "../components/ThemeToggle";


export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { mode, toggle } = useThemeToggle();
    const theme = React.useMemo(() => createTheme({ palette: { mode } }), [mode]);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};


const MyAppBar = (props: any) => {
    const { mode, toggle } = useThemeToggle(); // новый экземпляр — только ради иконки
    return (
        <AppBar {...props}>
            <TitlePortal />
            <Box sx={{ flex: 1 }} />
            <ThemeToggle mode={mode} onClick={toggle} />
        </AppBar>
    );
};


export const MyLayout = (props: any) => <RaLayout {...props} appBar={MyAppBar} />;