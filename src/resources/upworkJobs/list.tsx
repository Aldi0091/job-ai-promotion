// src/resources/upworkJobs/list.tsx
import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  TopToolbar,
  ExportButton,
  Pagination,
  FunctionField,
  useDelete,
  useNotify,
  useRefresh,
} from "react-admin";

import { Link } from "react-router-dom";

import type { UpworkJob } from "../../types/upwork";

import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Link as MuiLink,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import { JobsAside } from "./aside";


/* ----------------------------- Pagination ----------------------------- */

const JobsPagination = (props: any) => (
  <Pagination rowsPerPageOptions={[10, 20, 50, 100, 200]} {...props} />
);


/* ------------------------------- Actions ------------------------------- */

const ListActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
);


/* ------------------------------ Utilities ------------------------------ */

const formatRange = (
  lo?: number | null,
  hi?: number | null,
  unit?: string
) => {
  if (lo == null && hi == null) return "—";
  return `$${lo ?? "?"}–$${hi ?? "?"}${unit ?? ""}`;
};

const cleanTotalSpent = (value?: string | null) => {
  if (!value) return "—";
  return value.replace(/\s*total spent/i, "");
};


/* ----------------------------- Range Field ----------------------------- */

const RangeField: React.FC<{
  label: string;
  min: keyof UpworkJob;
  max: keyof UpworkJob;
  unit?: string;
}> = ({ label, min, max, unit }) => (
  <FunctionField
    label={label}
    render={(r: UpworkJob) =>
      formatRange(r?.[min] as number, r?.[max] as number, unit)
    }
  />
);


/* --------------------------- Description Cell -------------------------- */

const DescriptionCell: React.FC<{ record: UpworkJob }> = ({ record }) => {
  const [open, setOpen] = React.useState(false);

  const desc = record?.description || "";
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(desc);

  if (!desc) return <>—</>;

  return (
    <>
      <Box
        sx={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          whiteSpace: "pre-wrap",
        }}
      >
        {desc}
      </Box>

      <Button
        size="small"
        variant="text"
        onClick={() => setOpen(true)}
        sx={{ mt: 0.5, p: 0, minWidth: 0, textTransform: "none" }}
      >
        View
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Full Description</DialogTitle>

        <DialogContent dividers>
          {looksLikeHtml ? (
            <Box
              dangerouslySetInnerHTML={{ __html: desc }}
              sx={{ wordBreak: "break-word" }}
            />
          ) : (
            <Typography
              component="pre"
              sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", m: 0 }}
            >
              {desc}
            </Typography>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};


/* ----------------------------- Delete Button --------------------------- */

const DeleteJobButton: React.FC<{ id: number }> = ({ id }) => {
  const [deleteOne, { isLoading }] = useDelete();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleDelete = () => {
    if (!window.confirm(`Delete job #${id}?`)) return;

    deleteOne(
      "upwork-jobs",
      { id },
      {
        onSuccess: () => {
          notify(`Job #${id} deleted`, { type: "info" });
          refresh();
        },
        onError: (error: any) => {
          notify(error?.body?.detail || error.message, { type: "warning" });
        },
      }
    );
  };

  return (
    <IconButton size="small" onClick={handleDelete} disabled={isLoading}>
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
};


/* ------------------------------ Main List ------------------------------ */

export const UpworkJobsList = () => (
  <List
    actions={<ListActions />}
    pagination={<JobsPagination />}
    perPage={20}
    sort={{ field: "id", order: "DESC" }}
    aside={<JobsAside />}
  >
    <Datagrid
      bulkActionButtons={false}
      rowClick={false}
      sx={{
        "& .RaDatagrid-thead": {
          position: "sticky",
          top: 0,
          zIndex: 1,
        },
      }}
    >

      {/* ID */}
      <FunctionField
        label="ID"
        render={(record: UpworkJob) => (
          <Link to={`/upwork-jobs/${record.id}/show`}>
            {record.id}
          </Link>
        )}
      />

      {/* Title → link to Upwork */}
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

      {/* Client */}
      <TextField source="client_country" label="Country" />
      <TextField source="client_city" label="City" />
      <TextField source="client_rating" label="Rating" />

      {/* Rate */}
      <TextField source="job_rate_type" label="Rate Type" />

      <RangeField
        label="Hourly Rate"
        min="job_hourly_min"
        max="job_hourly_max"
        unit="/hr"
      />

      <RangeField
        label="Budget"
        min="job_budget_min"
        max="job_budget_max"
        unit=""
      />

      {/* Total Spent */}
      <FunctionField
        label="Total Spent"
        render={(record: UpworkJob) =>
          cleanTotalSpent(record?.client_total_spent)
        }
      />

      {/* Scraped */}
      <DateField source="scraped_at" label="Scraped" showTime />

      {/* Actions */}
      <FunctionField
        label="Actions"
        render={(r: UpworkJob) => <DeleteJobButton id={r.id} />}
      />

    </Datagrid>
  </List>
);