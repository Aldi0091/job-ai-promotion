// src/resources/upworkJobs/show.tsx
import * as React from "react";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import IconButton from "@mui/material/IconButton";
import { Show, TopToolbar, ListButton, useRecordContext } from "react-admin";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  Link as MuiLink,
  Tooltip,
} from "@mui/material";
import type { UpworkJob } from "../../types/upwork";
import ReactMarkdown from "react-markdown";
import { JobChat } from "./jobChat";

const HeaderActions = () => (
  <TopToolbar>
    <ListButton label="Back to list" />
  </TopToolbar>
);

const CopySubmissionButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.error("Clipboard copy failed", e);
    }
  };

  return (
    <Tooltip title={copied ? "Copied" : "Copy submission"}>
      <IconButton size="small" onClick={handleCopy}>
        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};

// Универсальная подпись + значение
const LabeledValue: React.FC<{ label: string; children?: React.ReactNode }> = ({ label, children }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="overline" sx={{ opacity: 0.65, letterSpacing: 0.6 }}>
      {label}
    </Typography>
    <Typography variant="body1">{children ?? "—"}</Typography>
  </Box>
);

// Компактный стат-блок (карточки над сеткой)
const StatCard: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => (
  <Card variant="outlined" sx={{ borderRadius: 2 }}>
    <CardContent sx={{ py: 1.5 }}>
      <Typography variant="overline" sx={{ opacity: 0.65 }}>{label}</Typography>
      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
        {value ?? "—"}
      </Typography>
    </CardContent>
  </Card>
);

const MoneyRange: React.FC<{ lo?: number | null; hi?: number | null; suffix?: string }> = ({ lo, hi, suffix }) => {
  if (lo == null && hi == null) return <>—</>;
  return <>${lo ?? "?"}–${hi ?? "?"}{suffix}</>;
};

const DescriptionBlock: React.FC<{ html?: string | null }> = ({ html }) => {
  const text = html ?? "";
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(text);
  if (!text) return <>—</>;
  return looksLikeHtml ? (
    <Box dangerouslySetInnerHTML={{ __html: text }} sx={{ "& *": { maxWidth: "100%" } }} />
  ) : (
    <Typography component="pre" sx={{ whiteSpace: "pre-wrap", m: 0 }}>
      {text}
    </Typography>
  );
};

// Секция с заголовком
const Section: React.FC<{ title: string; children: React.ReactNode; sx?: any }> = ({ title, children, sx }) => (
  <Box sx={{ ...sx }}>
    <Typography variant="subtitle2" sx={{ opacity: 0.7, mb: 1.25 }}>
      {title}
    </Typography>
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>{children}</CardContent>
    </Card>
  </Box>
);

const JobShowContent = () => {
  const r = useRecordContext<UpworkJob>();
  if (!r) return null;

  return (
    <Box sx={{ display: "flex", gap: 2, p: 2, alignItems: "flex-start" }}>
      {/* LEFT: job details */}
      <Box sx={{ flex: "0 0 58%", display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
        {/* Header */}
        <Card elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent sx={{ pb: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 900 }}>
                  #{r.id} — {r.job_title ?? "Untitled"}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                  {r.job_featured && <Chip label="Featured" color="primary" size="small" />}
                  {r.job_rate_type && <Chip label={r.job_rate_type} size="small" variant="outlined" />}
                  {r.job_experience_level && <Chip label={r.job_experience_level} size="small" variant="outlined" />}
                  {r.job_duration && <Chip label={r.job_duration} size="small" variant="outlined" />}
                </Stack>
              </Box>
              {r.source_url && (
                <MuiLink href={r.source_url} target="_blank" rel="noopener" underline="hover">
                  View on Upwork →
                </MuiLink>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Stats row */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <StatCard label="Hourly Range" value={<MoneyRange lo={r.job_hourly_min} hi={r.job_hourly_max} suffix="/hr" />} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard label="Budget Range" value={<MoneyRange lo={r.job_budget_min} hi={r.job_budget_max} suffix=" budget" />} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <StatCard label="Scraped At" value={r.scraped_at ?? "—"} />
          </Grid>
        </Grid>
        
        {/* Client */}
        <Section title="Client">
          <Grid container spacing={1.5}>
            <Grid item xs={6}><LabeledValue label="Country">{r.client_country}</LabeledValue></Grid>
            <Grid item xs={6}><LabeledValue label="City">{r.client_city}</LabeledValue></Grid>
            <Grid item xs={6}><LabeledValue label="Rating">{r.client_rating}</LabeledValue></Grid>
            <Grid item xs={6}><LabeledValue label="Reviews">{r.client_reviews}</LabeledValue></Grid>
            <Grid item xs={6}>
              <LabeledValue label="Payment Verified">
                {r.client_payment_method_verified == null ? "—" : (r.client_payment_method_verified ? "Yes" : "No")}
              </LabeledValue>
            </Grid>
            <Grid item xs={6}>
              <LabeledValue label="Phone Verified">
                {r.client_phone_verified == null ? "—" : (r.client_phone_verified ? "Yes" : "No")}
              </LabeledValue>
            </Grid>
            <Grid item xs={6}><LabeledValue label="Member Since">{r.client_member_since}</LabeledValue></Grid>
            <Grid item xs={6}><LabeledValue label="Company Size">{r.client_company_size}</LabeledValue></Grid>
            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
            <Grid item xs={12}><LabeledValue label="Local Time">{r.client_local_time}</LabeledValue></Grid>
            <Grid item xs={12}><LabeledValue label="Total Spent">{r.client_total_spent}</LabeledValue></Grid>
            <Grid item xs={12}><LabeledValue label="Jobs Posted">{r.client_jobs_posted}</LabeledValue></Grid>
            <Grid item xs={12}><LabeledValue label="Hires / Active">{r.client_hires_active}</LabeledValue></Grid>
            <Grid item xs={12}><LabeledValue label="Avg Hourly Rate">{r.client_avg_hourly_rate}</LabeledValue></Grid>
            <Grid item xs={12}><LabeledValue label="Hours">{r.client_hours}</LabeledValue></Grid>
            <Grid item xs={12}><LabeledValue label="Hiring Stats">{r.client_hiring_stats}</LabeledValue></Grid>
          </Grid>
        </Section>

        {/* Description */}
        <Section title="Description">
          <DescriptionBlock html={r.description} />
        </Section>

        {/* AI Summary */}
        {r.ai_review?.summary_md && (
          <Section title="AI Summary">
            <ReactMarkdown
              components={{
                h1: (p) => <Typography variant="h5" gutterBottom {...p} />,
                h2: (p) => <Typography variant="h6" gutterBottom {...p} />,
                h3: (p) => <Typography variant="subtitle1" gutterBottom {...p} />,
                p: (p) => <Typography sx={{ mb: 1.5 }} {...p} />,
                li: (p) => <li><Typography component="span" {...p} /></li>,
                code: (p) => (
                  <Box component="code" sx={{ bgcolor: "action.hover", px: 0.5, py: 0.25, borderRadius: 1 }} {...p} />
                ),
                pre: (p) => (
                  <Box component="pre" sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2, overflowX: "auto" }} {...p} />
                ),
                a: (p) => <MuiLink underline="hover" target="_blank" rel="noopener" {...p} />,
              }}
            >
              {r.ai_review.summary_md}
            </ReactMarkdown>
          </Section>
        )}

        
      </Box>

      {/* RIGHT: chat */}
      <Box sx={{ flex: "0 0 40%", position: "sticky", top: 16, minWidth: 0 }}>
        {/* Job Details */}
        <Section sx={{ mt: 0 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={6}><LabeledValue label="Rate Type">{r.job_rate_type}</LabeledValue></Grid>
            <Grid item xs={6}><LabeledValue label="Experience">{r.job_experience_level}</LabeledValue></Grid>
            <Grid item xs={6}><LabeledValue label="Duration">{r.job_duration}</LabeledValue></Grid>
            <Grid item xs={6}><LabeledValue label="Hours/Week">{r.job_hours_per_week}</LabeledValue></Grid>
            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
            <Grid item xs={12}><LabeledValue label="Hourly Range"><MoneyRange lo={r.job_hourly_min} hi={r.job_hourly_max} suffix="/hr" /></LabeledValue></Grid>
            <Grid item xs={12}><LabeledValue label="Budget Range"><MoneyRange lo={r.job_budget_min} hi={r.job_budget_max} suffix=" budget" /></LabeledValue></Grid>
            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
            <Grid item xs={12}><LabeledValue label="Scraped At">{r.scraped_at ?? "—"}</LabeledValue></Grid>
            <Grid item xs={12}><LabeledValue label="Source URL">
              {r.source_url ? (
                <Tooltip title="Open original job page">
                  <MuiLink href={r.source_url} target="_blank" rel="noopener" underline="hover">
                    {r.source_url}
                  </MuiLink>
                </Tooltip>
              ) : "—"}
            </LabeledValue></Grid>
          </Grid>
        </Section>
        {/* Submission Draft */}
        {r.ai_review?.submission_md && (
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, mt: 3 }}>
              <Typography variant="subtitle2" sx={{ opacity: 0.7 }}>
                Submission Draft
              </Typography>
              <CopySubmissionButton text={r.ai_review.submission_md} />
            </Box>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <ReactMarkdown
                  components={{
                    p: (p) => <Typography sx={{ mb: 1.5 }} {...p} />,
                    li: (p) => <li><Typography component="span" {...p} /></li>,
                    a: (p) => <MuiLink underline="hover" target="_blank" rel="noopener" {...p} />,
                    pre: (p) => (
                      <Box component="pre" sx={{ p: 1.5, bgcolor: "action.hover", borderRadius: 2, overflowX: "auto" }} {...p} />
                    ),
                  }}
                >
                  {r.ai_review.submission_md}
                </ReactMarkdown>
              </CardContent>
            </Card>
          </Box>
        )}
        <Section title="Chat about this job" sx={{ mt: 3 }}>
          <JobChat jobId={r.id} />
        </Section>
      </Box>
    </Box>
  );
};

export const UpworkJobShow = () => (
  <Show actions={<HeaderActions />}>
    <JobShowContent />
  </Show>
);
