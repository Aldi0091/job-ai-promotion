import * as React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  TopToolbar,
  CreateButton,
  SearchInput,
  Pagination,
  required,
  maxLength,
  useNotify,
  useDelete,
  useRecordContext,
  useRefresh,
  useResourceContext,
  Button,
} from "react-admin";
import DeleteIcon from "@mui/icons-material/Delete";

const filters = [<SearchInput key="q" source="q" alwaysOn />];

const StacksActions = () => (
  <TopToolbar>
    <CreateButton />
  </TopToolbar>
);

const StacksPagination = () => <Pagination rowsPerPageOptions={[25, 50, 100]} />;

const nameValidate = [required(), maxLength(120)];

const transform = (data: any) => ({
  ...data,
  name: String(data?.name ?? "").trim(),
});

const InstantDeleteButton = () => {
  const record = useRecordContext();
  const resource = useResourceContext();
  const [deleteOne, { isLoading }] = useDelete();
  const refresh = useRefresh();
  const notify = useNotify();
  if (!record || !resource) return null;
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteOne(
      resource,
      { id: record.id, previousData: record },
      {
        mutationMode: "optimistic",
        onSuccess: () => refresh(),
        onError: (error: any) =>
          notify(String(error?.message ?? "Error"), { type: "error" }),
      },
    );
  };
  return (
    <Button
      label=""
      onClick={handleClick}
      disabled={isLoading}
      sx={{ minWidth: 0 }}
    >
      <DeleteIcon fontSize="small" />
    </Button>
  );
};

const useStackErrorHandler = () => {
  const notify = useNotify();
  return (error: any) => {
    const msg = String(error?.message ?? "");
    if (msg.includes("already exists")) {
      notify("A stack with this name already exists.", { type: "warning" });
    } else {
      notify(msg || "Error", { type: "error" });
    }
  };
};

export const StacksList = () => (
  <List
    filters={filters}
    actions={<StacksActions />}
    sort={{ field: "name", order: "ASC" }}
    perPage={50}
    pagination={<StacksPagination />}
  >
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="id" />
      <TextField source="name" />
      <DateField source="updated_at" showTime />
      <EditButton label="" />
      <InstantDeleteButton />
    </Datagrid>
  </List>
);

export const StackCreate = () => {
  const onError = useStackErrorHandler();
  return (
    <Create transform={transform} redirect="list" mutationOptions={{ onError }}>
      <SimpleForm>
        <TextInput source="name" validate={nameValidate} fullWidth />
      </SimpleForm>
    </Create>
  );
};

export const StackEdit = () => {
  const onError = useStackErrorHandler();
  return (
    <Edit transform={transform} redirect="list" mutationMode="pessimistic" mutationOptions={{ onError }}>
      <SimpleForm>
        <TextInput source="id" disabled />
        <TextInput source="name" validate={nameValidate} fullWidth />
        <TextInput source="updated_at" disabled />
      </SimpleForm>
    </Edit>
  );
};
