// src/resources/upworkJobs/semanticSearch.tsx
import * as React from "react";
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Link as MuiLink,
  CircularProgress,
  Alert,
} from "@mui/material";
import { httpJson } from "../../utils/http";

type SearchItem = {
  id: number;
  job_title?: string | null;
  source_url?: string | null;
  client_country?: string | null;
  client_city?: string | null;
  job_rate_type?: string | null;
  job_hourly_min?: number | null;
  job_hourly_max?: number | null;
  job_budget_min?: number | null;
  job_budget_max?: number | null;
  scraped_at?: string | null;
  score?: number | null;
};

export function UpworkSemanticSearch() {
  const [q, setQ] = useState("");
  const [k, setK] = useState(10);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<SearchItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await httpJson(
        `/api/upwork-jobs/semantic-search?q=${encodeURIComponent(q)}&k=${k}`
      );
      setItems(data?.items ?? []); // важное исправление: берем data.items
    } catch (e: any) {
      setError(e.message || "Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        🔎 Semantic Search
      </Typography>

      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
        <TextField
          label="Query"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="Top K"
          type="number"
          value={k}
          onChange={(e) => setK(Math.max(1, Number(e.target.value || 10)))}
          size="small"
          sx={{ width: 110 }}
        />
        <Button variant="contained" onClick={onSearch} disabled={loading}>
          {loading ? <CircularProgress size={18} /> : "Search"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {items.length > 0 && (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Country</TableCell>
                <TableCell>City</TableCell>
                <TableCell>Rate Type</TableCell>
                <TableCell>Hourly</TableCell>
                <TableCell>Budget</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>
                    {r.source_url ? (
                      <MuiLink
                        href={r.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        underline="hover"
                      >
                        {r.job_title || "—"}
                      </MuiLink>
                    ) : (
                      r.job_title || "—"
                    )}
                  </TableCell>
                  <TableCell>{r.client_country || "—"}</TableCell>
                  <TableCell>{r.client_city || "—"}</TableCell>
                  <TableCell>{r.job_rate_type || "—"}</TableCell>
                  <TableCell>
                    {r.job_hourly_min ?? "?"}–{r.job_hourly_max ?? "?"}
                  </TableCell>
                  <TableCell>
                    {r.job_budget_min ?? "?"}–{r.job_budget_max ?? "?"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
