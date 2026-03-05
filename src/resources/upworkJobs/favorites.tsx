// src/resources/upworkJobs/favorites.tsx
import * as React from "react";

import {
  List,
  Datagrid,
  TextField,
  DateField,
  FunctionField,
} from "react-admin";

import { Link } from "react-router-dom";
import type { UpworkJob } from "../../types/upwork";

import { Box, IconButton, Link as MuiLink } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { useUpdate, useRefresh, useNotify } from "react-admin";


const UnfavoriteButton: React.FC<{ record: UpworkJob }> = ({ record }) => {
  const [updateOne, { isLoading }] = useUpdate();
  const refresh = useRefresh();
  const notify = useNotify();

  const handleClick = () => {
    updateOne(
      "upwork-jobs",
      {
        id: record.id,
        data: { favorite: false },
        previousData: record,
      },
      {
        mutationMode: "pessimistic",
        onSuccess: () => refresh(),
        onError: (error: any) => notify(error?.message || "Failed", { type: "warning" }),
      }
    );
  };

  return (
    <IconButton size="small" onClick={handleClick} disabled={isLoading}>
      <StarIcon fontSize="small" />
    </IconButton>
  );
};


export const UpworkFavoritesList = () => (
  <List
    title="Favorites"
    perPage={50}
    sort={{ field: "id", order: "DESC" }}
    filterDefaultValues={{ favorite: true }}
    // resource name is "upwork-jobs-favorites" (defined in App.tsx)
  >
    <Datagrid bulkActionButtons={false} rowClick={false}>
      <FunctionField
        label="ID"
        render={(record: UpworkJob) => (
          <Link to={`/upwork-jobs/${record.id}/show`}>{record.id}</Link>
        )}
      />

      <FunctionField
        label="Title"
        render={(r: UpworkJob) =>
          r?.source_url ? (
            <MuiLink
              href={r.source_url}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              {r.job_title || "—"}
            </MuiLink>
          ) : (
            <TextField source="job_title" />
          )
        }
      />

      <TextField source="client_country" label="Country" />
      <TextField source="client_city" label="City" />
      <TextField source="client_rating" label="Rating" />
      <TextField source="job_rate_type" label="Rate Type" />
      <DateField source="scraped_at" label="Scraped" showTime />

      <FunctionField
        label="Actions"
        render={(r: UpworkJob) => (
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <UnfavoriteButton record={r} />
          </Box>
        )}
      />
    </Datagrid>
  </List>
);
