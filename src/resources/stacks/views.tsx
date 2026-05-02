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
  useDataProvider,
  Button,
  Confirm,
} from "react-admin";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import DownloadIcon from "@mui/icons-material/Download";
import UploadIcon from "@mui/icons-material/Upload";

const filters = [<SearchInput key="q" source="q" alwaysOn />];

const csvEscape = (v: string) => {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
};

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        field = "";
        if (row.length > 1 || row[0] !== "") rows.push(row);
        row = [];
      } else {
        field += c;
      }
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

const ExportCsvButton = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const handleExport = async () => {
    try {
      const perPage = 500;
      const all: any[] = [];
      let page = 1;
      while (true) {
        const { data, total } = await dataProvider.getList("stacks", {
          pagination: { page, perPage },
          sort: { field: "name", order: "ASC" },
          filter: {},
        });
        all.push(...data);
        const reachedTotal = typeof total === "number" && all.length >= total;
        if (data.length < perPage || reachedTotal) break;
        page++;
      }
      const lines = [
        "name",
        ...all.map((r: any) => csvEscape(String(r?.name ?? ""))),
      ];
      const blob = new Blob([lines.join("\n")], {
        type: "text/csv;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stacks-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      notify(String(e?.message ?? "Export failed"), { type: "error" });
    }
  };
  return (
    <Button label="Export CSV" onClick={handleExport}>
      <DownloadIcon fontSize="small" />
    </Button>
  );
};

const ImportCsvButton = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length === 0) {
        notify("CSV is empty", { type: "warning" });
        return;
      }
      const headers = rows[0].map((h) => h.trim().toLowerCase());
      const nameIdx = headers.indexOf("name");
      if (nameIdx === -1) {
        notify("CSV must include a 'name' column", { type: "error" });
        return;
      }
      const dataRows = rows.slice(1).filter((r) => (r[nameIdx] ?? "").trim());
      let ok = 0;
      let fail = 0;
      for (const r of dataRows) {
        try {
          await dataProvider.create("stacks", {
            data: { name: r[nameIdx].trim() },
          });
          ok++;
        } catch {
          fail++;
        }
      }
      notify(
        `Imported ${ok} stack(s)${fail ? `, ${fail} failed` : ""}`,
        { type: fail ? "warning" : "success" },
      );
      refresh();
    } catch (err: any) {
      notify(String(err?.message ?? "Import failed"), { type: "error" });
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  };
  return (
    <>
      <input
        type="file"
        accept=".csv,text/csv"
        ref={inputRef}
        style={{ display: "none" }}
        onChange={handleFile}
      />
      <Button label="Import CSV" onClick={() => inputRef.current?.click()}>
        <UploadIcon fontSize="small" />
      </Button>
    </>
  );
};

const FlushTableButton = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const handleConfirm = async () => {
    setLoading(true);
    try {
      const perPage = 500;
      const allIds: any[] = [];
      while (true) {
        const { data } = await dataProvider.getList("stacks", {
          pagination: { page: 1, perPage },
          sort: { field: "name", order: "ASC" },
          filter: {},
        });
        if (data.length === 0) break;
        allIds.push(...data.map((r: any) => r.id));
        if (data.length < perPage) break;
      }
      let ok = 0;
      let fail = 0;
      for (const id of allIds) {
        try {
          await dataProvider.delete("stacks", { id, previousData: { id } });
          ok++;
        } catch {
          fail++;
        }
      }
      notify(
        `Flushed ${ok} stack(s)${fail ? `, ${fail} failed` : ""}`,
        { type: fail ? "warning" : "success" },
      );
      refresh();
    } catch (e: any) {
      notify(String(e?.message ?? "Flush failed"), { type: "error" });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };
  return (
    <>
      <Button
        label="Flush Table"
        onClick={() => setOpen(true)}
        disabled={loading}
        sx={{ color: "error.main" }}
      >
        <DeleteSweepIcon fontSize="small" />
      </Button>
      <Confirm
        isOpen={open}
        loading={loading}
        title="Flush stacks table"
        content="This will permanently remove ALL stack records. This action cannot be undone. Are you sure?"
        onConfirm={handleConfirm}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

const StacksActions = () => (
  <TopToolbar>
    <CreateButton />
    <ImportCsvButton />
    <ExportCsvButton />
    <FlushTableButton />
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
