import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  ShowButton,
  DeleteButton,
  FunctionField,
  Create,
  Edit,
  Show,
  SimpleForm,
  TextInput,
  SelectInput,
  DateTimeInput,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  SearchInput,
  required,
  useRecordContext,
} from "react-admin";
import { Box, Chip, Divider, Grid, Paper, Stack, Typography } from "@mui/material";

const submissionStatusChoices = [
  { id: "not_submitted", name: "Not submitted" },
  { id: "submitted", name: "Submitted" },
  { id: "interview_scheduled", name: "Interview scheduled" },
  { id: "withdrawn", name: "Withdrawn" },
];

const responseStatusChoices = [
  { id: "awaiting", name: "Awaiting" },
  { id: "accepted", name: "Accepted" },
  { id: "declined", name: "Declined" },
  { id: "no_response", name: "No response" },
];

const sourceChoices = [
  { id: "linkedin", name: "LinkedIn" },
  { id: "indeed", name: "Indeed" },
  { id: "greenhouse", name: "Greenhouse" },
  { id: "lever", name: "Lever" },
  { id: "upwork", name: "Upwork" },
  { id: "other", name: "Other" },
];

const filters = [
  <SearchInput key="q" source="q" alwaysOn />,
  <SelectInput key="submission_status" source="submission_status" label="Submission" choices={submissionStatusChoices} />,
  <SelectInput key="response_status" source="response_status" label="Response" choices={responseStatusChoices} />,
  <SelectInput key="source" source="source" label="Source" choices={sourceChoices} />,
];

const JobTrackerActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

const JobApplicationFormFields = () => (
  <>
    <TextInput source="title" fullWidth validate={required()} />
    <TextInput source="company_name" fullWidth validate={required()} />
    <TextInput source="job_url" fullWidth validate={required()} />
    <SelectInput source="submission_status" fullWidth choices={submissionStatusChoices} defaultValue="not_submitted" />
    <SelectInput source="response_status" fullWidth choices={responseStatusChoices} defaultValue="awaiting" />
    <SelectInput source="source" fullWidth choices={sourceChoices} emptyText="—" />
    <TextInput source="country" fullWidth />
    <TextInput source="city" fullWidth />
    <TextInput source="lead_name" fullWidth />
    <TextInput source="lead_contacts" fullWidth multiline minRows={2} />
    <TextInput source="description" fullWidth multiline minRows={6} />
    <TextInput source="notes" fullWidth multiline minRows={5} />
  </>
);

const SUBMISSION_CHIP: Record<string, "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"> = {
  not_submitted: "default",
  submitted: "primary",
  interview_scheduled: "secondary",
  withdrawn: "error",
};

const RESPONSE_CHIP: Record<string, "default" | "primary" | "secondary" | "error" | "warning" | "info" | "success"> = {
  awaiting: "warning",
  accepted: "success",
  declined: "error",
  no_response: "default",
};

export const JobApplicationsList = () => (
  <List filters={filters} actions={<JobTrackerActions />} sort={{ field: "updated_at", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="company_name" />
      <TextField source="city" />
      <TextField source="country" />
      <FunctionField
        source="submission_status"
        label="Submission Status"
        render={(record) => (
          <Chip
            label={record.submission_status?.replace(/_/g, " ") || "—"}
            color={SUBMISSION_CHIP[record.submission_status] ?? "default"}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        )}
      />
      <FunctionField
        source="response_status"
        label="Response Status"
        render={(record) => (
          <Chip
            label={record.response_status?.replace(/_/g, " ") || "—"}
            color={RESPONSE_CHIP[record.response_status] ?? "default"}
            size="small"
            sx={{ textTransform: "capitalize" }}
          />
        )}
      />
      <TextField source="lead_name" />
      <DateField source="updated_at" showTime />
      <EditButton label="" />
      <DeleteButton label="" mutationMode="pessimistic" />
    </Datagrid>
  </List>
);

export const JobApplicationCreate = () => (
  <Create redirect="show">
    <SimpleForm>
      <JobApplicationFormFields />
    </SimpleForm>
  </Create>
);

export const JobApplicationEdit = () => (
  <Edit redirect="show">
    <SimpleForm>
      <JobApplicationFormFields />
    </SimpleForm>
  </Edit>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <Typography variant="overline" color="text.secondary" sx={{ display: "block", mb: 1.5, lineHeight: 1 }}>
    {children}
  </Typography>
);

const FieldBlock = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body2">{children}</Typography>
  </Box>
);

const JobApplicationShowLayout = () => {
  const record = useRecordContext();
  if (!record) return null;

  const location = [record.city, record.country].filter(Boolean).join(", ") || "—";
  const submissionColor = SUBMISSION_CHIP[record.submission_status] ?? "default";
  const responseColor = RESPONSE_CHIP[record.response_status] ?? "default";

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={2}>

        {/* Row 1 col 1: Identity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
            <Typography variant="overline" color="text.secondary">{record.company_name || "—"}</Typography>
            <Typography variant="h5" fontWeight={700} gutterBottom>{record.title || "Untitled"}</Typography>
            {record.job_url && (
              <Typography
                component="a"
                href={record.job_url}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                color="primary"
                sx={{ wordBreak: "break-all" }}
              >
                {record.job_url}
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Row 1 col 2: Status */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
            <SectionLabel>Status</SectionLabel>
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Submission</Typography>
                <Chip
                  label={record.submission_status?.replace(/_/g, " ") || "—"}
                  color={submissionColor}
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Response</Typography>
                <Chip
                  label={record.response_status?.replace(/_/g, " ") || "—"}
                  color={responseColor}
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>
              <Divider />
              <FieldBlock label="Source">{record.source?.replace(/_/g, " ") || "—"}</FieldBlock>
              <FieldBlock label="Location">{location}</FieldBlock>
            </Stack>
          </Paper>
        </Grid>

        {/* Row 2 col 1: Lead */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
            <SectionLabel>Lead</SectionLabel>
            <Stack spacing={2}>
              <FieldBlock label="Name">{record.lead_name || "—"}</FieldBlock>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>Contacts</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{record.lead_contacts || "—"}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Row 2 col 2: Description */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
            <SectionLabel>Description</SectionLabel>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "text.secondary" }}>
              {record.description || "—"}
            </Typography>
          </Paper>
        </Grid>

        {/* Row 3: Notes full width */}
        <Grid size={{ xs: 12 }}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <SectionLabel>Notes</SectionLabel>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "text.secondary" }}>
              {record.notes || "—"}
            </Typography>
          </Paper>
        </Grid>

        {/* Footer */}
        <Grid size={{ xs: 12 }}>
          <Stack direction="row" spacing={3}>
            <Typography variant="caption" color="text.disabled">
              Created: {record.created_at ? new Date(record.created_at).toLocaleString() : "—"}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Updated: {record.updated_at ? new Date(record.updated_at).toLocaleString() : "—"}
            </Typography>
          </Stack>
        </Grid>

      </Grid>
    </Box>
  );
};

export const JobApplicationShow = () => (
  <Show>
    <JobApplicationShowLayout />
  </Show>
);
