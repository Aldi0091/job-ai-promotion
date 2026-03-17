// src/resources/upworkJobs/favorites.tsx
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
  useUpdate,
  AutocompleteArrayInput,
  useGetList,
  FilterForm,
} from "react-admin";
import { Stack } from "@mui/material";
import { Link } from "react-router-dom";

import type { UpworkJob } from "../../types/upwork";

import {
  Box,
  IconButton,
  Link as MuiLink,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const JobsPagination = (props: any) => (
  <Pagination rowsPerPageOptions={[10, 20, 50, 100, 200]} {...props} />
);

const ListActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
);

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

const parseMoneySpent = (value?: string | null) => {
  if (!value) return null;

  const s = String(value).toUpperCase().replace(/TOTAL SPENT/gi, "").trim();
  const m = s.match(/([\d.,]+)\s*([KM])?/i);
  if (!m) return null;

  const n = parseFloat(m[1].replace(/,/g, ""));
  if (Number.isNaN(n)) return null;

  const mult = m[2] === "M" ? 1_000_000 : m[2] === "K" ? 1_000 : 1;
  return n * mult;
};

const getHourlyMax = (r: UpworkJob) => {
  const lo = r?.job_hourly_min ?? null;
  const hi = r?.job_hourly_max ?? null;
  const best = Math.max(lo ?? -Infinity, hi ?? -Infinity);
  return Number.isFinite(best) ? best : null;
};

const getSignal = (r: UpworkJob) => {
  const hourly = getHourlyMax(r);
  const spent = parseMoneySpent(r?.client_total_spent);

  const hourlyOk = hourly != null && hourly > 25;
  const spentOk = spent != null && spent > 15_000;

  if (hourlyOk && spentOk) return "green";
  if (hourlyOk || spentOk) return "orange";
  return null;
};

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

type CountryMultiFilterInputProps = {
  source?: string;
  label?: string;
  alwaysOn?: boolean;
};

function CountryMultiFilterInput(props: CountryMultiFilterInputProps) {
  const { data, isLoading } = useGetList("upwork-job-countries", {
    pagination: { page: 1, perPage: 500 },
    sort: { field: "name", order: "ASC" },
    filter: {},
  });

  const choices = React.useMemo(() => {
    return ((data || []) as any[]).map((item) => ({
      id: item.id,
      name: item.name,
    }));
  }, [data]);

  return (
    <AutocompleteArrayInput
      {...props}
      choices={choices}
      optionText="name"
      optionValue="id"
      isLoading={isLoading}
      fullWidth
      sx={{ minWidth: 320 }}
    />
  );
}

const jobFilters = [
  <CountryMultiFilterInput
    key="country_multi_filter"
    source="client_countries"
    label="Countries"
    alwaysOn
  />,
];

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

const FavoriteJobButton: React.FC<{ record: UpworkJob }> = ({ record }) => {
  const [updateOne, { isLoading }] = useUpdate();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleToggle = () => {
    updateOne(
      "upwork-jobs",
      {
        id: record.id,
        data: { favorite: !record.favorite },
        previousData: record,
      },
      {
        mutationMode: "pessimistic",
        onSuccess: () => refresh(),
        onError: (error: any) => {
          notify(error?.message || "Failed to update favorite", { type: "warning" });
        },
      }
    );
  };

  return (
    <IconButton size="small" onClick={handleToggle} disabled={isLoading}>
      {record.favorite ? (
        <StarIcon fontSize="small" />
      ) : (
        <StarBorderIcon fontSize="small" />
      )}
    </IconButton>
  );
};

export const UpworkFavoritesList = () => (
  <List
    title="Favorites"
    actions={<ListActions />}
    pagination={<JobsPagination />}
    perPage={20}
    sort={{ field: "id", order: "DESC" }}
    filterDefaultValues={{ favorite: true }}
  >
    <Stack spacing={1} sx={{ mb: 1 }}>
      <FilterForm filters={jobFilters} />

      <Datagrid
        bulkActionButtons={false}
        rowClick={false}
        rowSx={(record: UpworkJob) => {
          const signal = getSignal(record);
          if (!signal) return {};

          if (signal === "green") {
            return {
              backgroundColor: "rgba(46, 125, 50, 0.10)",
              borderLeft: "4px solid rgba(46, 125, 50, 0.85)",
            };
          }

          return {
            backgroundColor: "rgba(245, 124, 0, 0.10)",
            borderLeft: "4px solid rgba(245, 124, 0, 0.85)",
          };
        }}
        sx={{
          "& .RaDatagrid-thead": { position: "sticky", top: 0, zIndex: 1 },
        }}
      >
        <FunctionField
          label="ID"
          render={(record: UpworkJob) => (
            <Link to={`/upwork-jobs/${record.id}/show`}>
              {record.id}
            </Link>
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

        <FunctionField
          label="Total Spent"
          render={(record: UpworkJob) =>
            cleanTotalSpent(record?.client_total_spent)
          }
        />

        <DateField source="scraped_at" label="Scraped" showTime />

        <FunctionField
          label="Actions"
          render={(r: UpworkJob) => (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <FavoriteJobButton record={r} />
              <DeleteJobButton id={r.id} />
            </Box>
          )}
        />
      </Datagrid>
    </Stack>
  </List>
);