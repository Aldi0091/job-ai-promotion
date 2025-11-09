// src/resources/upworkJobs/aside.tsx
import * as React from "react";
import { Card, CardContent } from "@mui/material";
import { FilterList, FilterListItem } from "react-admin";
import CategoryIcon from '@mui/icons-material/LocalOffer';


export const JobsAside: React.FC = () => (
  <Card sx={{ position: "sticky", top: 16 }}>
    <CardContent>
      <FilterList label="Quick Filters" icon={<CategoryIcon />}>
        {/* Сброс фильтра */}
        <FilterListItem label="All Jobs" value={{}} />
        {/* Только почасовые */}
        <FilterListItem label="Only Hourly Jobs" value={{ job_rate_type: "Hourly" }} />
      </FilterList>
    </CardContent>
  </Card>
);
