// src/resources/upworkJobs/ask.tsx
import * as React from "react";
import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link as MuiLink,
  Divider,
} from "@mui/material";
import { httpJson } from "../../utils/http";
import ReactMarkdown from "react-markdown";

type AskItem = {
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
};

export function UpworkAsk() {
  const [q, setQ] = useState("");
  const [k, setK] = useState(8);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>("");
  const [items, setItems] = useState<AskItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onAsk = async () => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await httpJson(
        `/api/upwork-jobs/ask?q=${encodeURIComponent(q)}&k=${k}`
      );
      setAnswer(data?.answer ?? "");
      setItems(data?.items ?? []);
    } catch (e: any) {
      setError(e.message || "Ask failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        💬 Ask AI (Upwork Jobs)
      </Typography>

      <Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
        <TextField
          label="Your question"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          fullWidth
          size="small"
        />
        <TextField
          label="Top K"
          type="number"
          value={k}
          onChange={(e) => setK(Math.max(1, Number(e.target.value || 8)))}
          size="small"
          sx={{ width: 110 }}
        />
        <Button variant="contained" onClick={onAsk} disabled={loading}>
          {loading ? <CircularProgress size={18} /> : "Ask"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {answer && (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            🤖 AI Answer
          </Typography>
          <Box sx={{ "& p": { mb: 1 } }}>
            <ReactMarkdown>{answer}</ReactMarkdown>
          </Box>
        </Paper>
      )}
      {items.length > 0 && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            📑 Context
          </Typography>
          {items.map((i, idx) => (
            <Box key={i.id} sx={{ mb: idx === items.length - 1 ? 0 : 1.5 }}>
              <MuiLink
                href={i.source_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                {i.job_title || "—"}
              </MuiLink>
              <Typography variant="body2" color="text.secondary">
                {i.client_country || "—"} / {i.client_city || "—"} |{" "}
                {i.job_rate_type || "—"} • {i.job_hourly_min ?? "?"}–{i.job_hourly_max ?? "?"} •{" "}
                {i.job_budget_min ?? "?"}–{i.job_budget_max ?? "?"}
              </Typography>
              {idx !== items.length - 1 && <Divider sx={{ mt: 1 }} />}
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}
