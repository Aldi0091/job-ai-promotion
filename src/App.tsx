// src/App.tsx
import * as React from "react";
import { Admin, Resource } from "react-admin";
import { dataProvider } from "./providers/dataProvider";
import { LayoutProvider, MyLayout } from "./layout/Layout";
import { upworkJobsResource, upworkFavoritesResource } from "./resources/upworkJobs";
import { UpworkSemanticSearch } from "./resources/upworkJobs/semanticSearch";
import { UpworkAsk } from "./resources/upworkJobs/ask";
import StarIcon from "@mui/icons-material/Star";
import TableChartIcon from "@mui/icons-material/TableChart";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LayersIcon from "@mui/icons-material/Layers";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import { jobApplicationsResource } from "./resources/jobApplications";
import { stacksResource } from "./resources/stacks";
import { UpworkDashboard } from "./resources/upworkDashboard";

export default function App() {
  return (
    <LayoutProvider>
      <Admin dataProvider={dataProvider} layout={MyLayout}>
        <Resource
          name="updash"
          list={UpworkDashboard}
          options={{ label: "Stats Dashboard" }}
          icon={DashboardCustomizeIcon}
        />
        <Resource {...upworkJobsResource} icon={TableChartIcon} />
        <Resource {...jobApplicationsResource} icon={ListAltIcon} />
        <Resource {...stacksResource} icon={LayersIcon} />
        <Resource {...upworkFavoritesResource} icon={StarIcon} />
        <Resource
          name="upwork-jobs-search"
          list={UpworkSemanticSearch}
          options={{ label: "Semantic Search" }}
          icon={ManageSearchIcon}
        />
        <Resource
          name="upwork-jobs-ask"
          list={UpworkAsk}
          options={{ label: "Ask AI" }}
          icon={AutoAwesomeIcon}
        />
      </Admin>
    </LayoutProvider>
  );
}
