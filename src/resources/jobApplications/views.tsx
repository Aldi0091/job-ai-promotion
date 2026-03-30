import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  ShowButton,
  DeleteButton,
  Create,
  Edit,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextInput,
  SelectInput,
  DateTimeInput,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  SearchInput,
  required,
  UrlField,
} from "react-admin";

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

export const JobApplicationsList = () => (
  <List filters={filters} actions={<JobTrackerActions />} sort={{ field: "updated_at", order: "DESC" }}>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="company_name" />
      <TextField source="city" />
      <TextField source="country" />
      <TextField source="submission_status" />
      <TextField source="response_status" />
      <TextField source="lead_name" />
      <DateField source="created_at" showTime />
      <DateField source="updated_at" showTime />
      <EditButton />
      <DeleteButton mutationMode="pessimistic" />
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

export const JobApplicationShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="title" />
      <TextField source="company_name" />
      <UrlField source="job_url" />
      <TextField source="submission_status" />
      <TextField source="response_status" />
      <TextField source="source" />
      <TextField source="country" />
      <TextField source="city" />
      <TextField source="lead_name" />
      <TextField source="lead_contacts" />
      <TextField source="description" />
      <TextField source="notes" />
      <DateField source="created_at" showTime />
      <DateField source="updated_at" showTime />
    </SimpleShowLayout>
  </Show>
);
