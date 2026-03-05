// src/App.tsx
import * as React from "react";
import { Admin, Resource } from "react-admin";
import { dataProvider } from "./providers/dataProvider";
import { LayoutProvider, MyLayout } from "./layout/Layout";
import { upworkJobsResource, upworkFavoritesResource } from "./resources/upworkJobs";
import { UpworkSemanticSearch } from "./resources/upworkJobs/semanticSearch";
import { UpworkAsk } from "./resources/upworkJobs/ask";
import StarIcon from "@mui/icons-material/Star";

export default function App() {
  return (
    <LayoutProvider>
      <Admin dataProvider={dataProvider} layout={MyLayout}>
        <Resource {...upworkJobsResource} />
        <Resource {...upworkFavoritesResource} icon={StarIcon} />
        <Resource
          name="upwork-jobs-search"
          list={UpworkSemanticSearch}
          options={{ label: "Semantic Search" }}
        />
        <Resource
          name="upwork-jobs-ask"
          list={UpworkAsk}
          options={{ label: "Ask AI" }}
        />
      </Admin>
    </LayoutProvider>
  );
}
