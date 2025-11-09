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
  Link
} from "react-admin";
import type { UpworkJob } from "../../types/upwork";
import {
  Box,
  Link as MuiLink,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { useDelete, useNotify, useRefresh } from "react-admin";
import { JobsAside } from "./aside";


const JobsPagination = (props: any) => (
  <Pagination rowsPerPageOptions={[10, 20, 50, 100, 200]} {...props} />
);

const ListActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
);

const RangeField = ({
  min,
  max,
  unit,
}: {
  min: keyof UpworkJob;
  max: keyof UpworkJob;
  unit: string;
}) => (
  <FunctionField
    label={`${String(min)}–${String(max)}`}
    render={(r: UpworkJob) => {
      const lo = r?.[min] as number | null | undefined;
      const hi = r?.[max] as number | null | undefined;
      return lo != null || hi != null ? `$${lo ?? "?"}–$${hi ?? "?"}${unit}` : "—";
    }}
  />
);

// 🔹 Ячейка с обрезкой + диалогом полного описания
const DescriptionCell: React.FC<{ record: UpworkJob }> = ({ record }) => {
  const [open, setOpen] = React.useState(false);
  const desc = record?.description || "";
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(desc);

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
        {desc || "—"}
      </Box>
      {desc && (
        <Button
          size="small"
          variant="text"
          onClick={() => setOpen(true)}
          sx={{ mt: 0.5, p: 0, minWidth: 0, textTransform: "none" }}
        >
          View
        </Button>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Full Description</DialogTitle>
        <DialogContent dividers>
          {looksLikeHtml ? (
            <Box
              dangerouslySetInnerHTML={{ __html: desc }}
              sx={{ whiteSpace: "normal", wordBreak: "break-word" }}
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

const DeleteJobButton: React.FC<{ id: number }> = ({ id }) => {
  const [deleteOne, { isLoading }] = useDelete();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleClick = () => {
    if (window.confirm(`Delete job #${id}?`)) {
      deleteOne(
        "upwork-jobs",
        { id },
        {
          onSuccess: () => {
            notify(`Deleted job #${id}`, { type: "info" });
            refresh();
          },
          onError: (error: any) => {
            notify(
              `Error deleting: ${error?.body?.detail || error.message}`,
              { type: "warning" }
            );
          },
        }
      );
    }
  };

  return (
    <IconButton onClick={handleClick} disabled={isLoading} size="small">
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
};


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
      sx={{ "& .RaDatagrid-thead": { position: "sticky", top: 0, zIndex: 1 } }}
    >
      <FunctionField
  label="ID"
  render={(record) => (
    <Link to={`/upwork-jobs/${record.id}/show`}>
      {record.id}
    </Link>
  )}
/>

      {/* 🔗 Title как ссылка на source_url */}
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
              {r?.job_title || "—"}
            </MuiLink>
          ) : (
            <TextField source="job_title" />
          )
        }
      />

      {/* 🌍 Клиент */}
      <TextField source="client_country" label="Country" />
      <TextField source="client_city" label="City" />
      <TextField source="client_rating" label="Rating" />

      {/* 💵 Ставки/Бюджеты */}
      <TextField source="job_rate_type" label="Rate Type" />
      <RangeField min="job_hourly_min" max="job_hourly_max" unit="/hr" />
      <RangeField min="job_budget_min" max="job_budget_max" unit=" budget" />

      {/* 📝 Описание: обрезка + кнопка View → диалог с полным текстом */}
      {/* <FunctionField
        label="Description"
        render={(r: UpworkJob) => <DescriptionCell record={r} />}
      /> */}
      <FunctionField
        label="Total Spent"
        render={(record: any) =>
          String(record?.client_total_spent ?? "").replace(/\s*total spent/i, "")
        }
      />

      <DateField source="scraped_at" label="Scraped" />
      <FunctionField
        label="Actions"
        render={(r: UpworkJob) => <DeleteJobButton id={r.id} />}
      />
    </Datagrid>
  </List>
);
