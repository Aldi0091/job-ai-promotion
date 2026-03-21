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
  useUpdate,
  AutocompleteArrayInput,
  useGetList,
  FilterForm,
} from "react-admin";
import { ListContextProvider, useListContext } from "react-admin";
import { Stack } from "@mui/material";
import { Link } from "react-router-dom";
import PsychologyIcon from "@mui/icons-material/Psychology";
import { Chip } from "@mui/material";
import { httpJson } from "../../utils/http";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";


import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";


const JobsPagination = (props: any) => (
  <Pagination rowsPerPageOptions={[10, 20, 50, 100, 200]} {...props} />
);


/* ------------------------------- Actions ------------------------------- */

const jobFilters = [
  <CountryMultiFilterInput
    key="country_multi_filter"
    source="client_countries"
    label="Countries"
    alwaysOn
  />,
];

const AssessLatestButton = () => {
  const [loading, setLoading] = React.useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleClick = async () => {
    const ok = window.confirm("Assess fit for latest 100 jobs?");
    if (!ok) return;

    try {
      setLoading(true);

      const res = await httpJson("/api/upwork-jobs/assess-fit-latest?limit=100", {
        method: "POST",
      });

      notify(
        `Done. Processed: ${res.processed}, failed: ${res.failed}`,
        { type: res.failed ? "warning" : "info" }
      );

      refresh();
    } catch (e: any) {
      notify(e?.message || "Failed to assess latest jobs", { type: "warning" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? "Assessing 100..." : "Assess latest 100"}
    </Button>
  );
};

const ListActions = () => (
  <TopToolbar>
    <AssessLatestButton />
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


/* --------------------------- Country Filter --------------------------- */

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

const AssessFitButton: React.FC<{ record: UpworkJob }> = ({ record }) => {
  const [loading, setLoading] = React.useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  const handleClick = async () => {
    try {
      setLoading(true);
      await httpJson(`/api/upwork-jobs/${record.id}/assess-fit`, {
        method: "POST",
      });
      notify("Fit assessed", { type: "info" });
      refresh();
    } catch (e: any) {
      notify(e?.message || "Failed to assess fit", { type: "warning" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <IconButton size="small" onClick={handleClick} disabled={loading}>
      <PsychologyIcon fontSize="small" />
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


const JobsTable: React.FC<{
  onlyGreen: boolean;
  minFitScore: number | null;
}> = ({ onlyGreen, minFitScore }) => {
  const list = useListContext<UpworkJob>();

  const filteredData = React.useMemo(() => {
    let rows = Array.isArray(list.data) ? list.data : [];

    if (onlyGreen) {
      rows = rows.filter((record) => getSignal(record) === "green");
    }

    if (minFitScore != null) {
      rows = rows.filter(
        (record) =>
          record.fit_score != null && Number(record.fit_score) >= minFitScore
      );
    }

    return rows;
  }, [list.data, onlyGreen, minFitScore]);

  const filteredIds = React.useMemo(
    () => filteredData.map((record) => record.id),
    [filteredData]
  );

  return (
    <ListContextProvider
      value={{
        ...list,
        data: filteredData,
        ids: filteredIds,
        total: filteredData.length,
      }}
    >
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

        <FunctionField
          label="Fit"
          render={(r: UpworkJob) => {
            if (r?.fit_score == null) return "—";

            return (
              <Chip
                size="small"
                label={`${r.fit_score}%`}
                variant="outlined"
              />
            );
          }}
        />

        <DateField source="scraped_at" label="Scraped" showTime />

        <FunctionField
          label="Actions"
          render={(r: UpworkJob) => (
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <AssessFitButton record={r} />
              <FavoriteJobButton record={r} />
              <DeleteJobButton id={r.id} />
            </Box>
          )}
        />
      </Datagrid>
    </ListContextProvider>
  );
};


/* ------------------------------ Main List ------------------------------ */

export const UpworkJobsList = () => {
  const [onlyGreen, setOnlyGreen] = React.useState(false);
  const [minFitScore, setMinFitScore] = React.useState<number | null>(null);

  return (
    <List
      actions={<ListActions />}
      pagination={<JobsPagination />}
      perPage={20}
      sort={{ field: "id", order: "DESC" }}
    >
      <Stack spacing={1} sx={{ mb: 1 }}>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
          <FilterForm filters={jobFilters} />

          <Button
            variant={onlyGreen ? "contained" : "outlined"}
            onClick={() => setOnlyGreen((prev) => !prev)}
          >
            {onlyGreen ? "Green only: ON" : "Green only"}
          </Button>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="fit-score-filter-label">Fit score</InputLabel>
            <Select
              labelId="fit-score-filter-label"
              value={minFitScore ?? ""}
              label="Fit score"
              onChange={(e) => {
                const value = e.target.value;
                setMinFitScore(value === "" ? null : Number(value));
              }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value={90}>{`>= 90`}</MenuItem>
              <MenuItem value={80}>{`>= 80`}</MenuItem>
              <MenuItem value={70}>{`>= 70`}</MenuItem>
              <MenuItem value={60}>{`>= 60`}</MenuItem>
              <MenuItem value={50}>{`>= 50`}</MenuItem>
              <MenuItem value={40}>{`>= 40`}</MenuItem>
              <MenuItem value={30}>{`>= 30`}</MenuItem>
              <MenuItem value={20}>{`>= 20`}</MenuItem>
              <MenuItem value={10}>{`>= 10`}</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <JobsTable onlyGreen={onlyGreen} minFitScore={minFitScore} />
      </Stack>
    </List>
  );
};

