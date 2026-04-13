import * as React from "react";
import { Layout as RaLayout, AppBar, TitlePortal } from "react-admin";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { useThemeToggle } from "../components/ThemeToggle";


export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { mode } = useThemeToggle();
    const theme = React.useMemo(() => createTheme({ palette: { mode } }), [mode]);
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};


const MyAppBar = (props: any) => (
    <AppBar {...props}>
        <TitlePortal />
    </AppBar>
);


export const MyLayout = (props: any) => <RaLayout {...props} appBar={MyAppBar} />;