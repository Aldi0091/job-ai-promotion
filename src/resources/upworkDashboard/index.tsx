import * as React from "react";
import { Title } from "react-admin";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  useTheme,
  alpha,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SendIcon from "@mui/icons-material/Send";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StarIcon from "@mui/icons-material/Star";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CancelIcon from "@mui/icons-material/Cancel";

// ---------------------------------------------------------------------------
// FAKE DATA — replace with FastAPI calls when backend is ready
// ---------------------------------------------------------------------------

// TODO: GET /api/upwork/stats/summary
const summaryStats = {
  totalJobsScraped: 2847,
  applicationsSent: 143,
  responseRate: 34.3,
  avgBudget: 4250,
  offersReceived: 5,
  activeProposals: 38,
};

// TODO: GET /api/upwork/stats/jobs-over-time?days=14
const jobsOverTime = [
  { date: "Mar 17", jobs: 82, applications: 4 },
  { date: "Mar 19", jobs: 97, applications: 6 },
  { date: "Mar 21", jobs: 115, applications: 8 },
  { date: "Mar 23", jobs: 78, applications: 3 },
  { date: "Mar 25", jobs: 134, applications: 11 },
  { date: "Mar 27", jobs: 109, applications: 7 },
  { date: "Mar 29", jobs: 143, applications: 9 },
  { date: "Mar 31", jobs: 91, applications: 5 },
  { date: "Apr 02", jobs: 122, applications: 12 },
  { date: "Apr 04", jobs: 156, applications: 10 },
  { date: "Apr 06", jobs: 88, applications: 6 },
  { date: "Apr 08", jobs: 174, applications: 14 },
  { date: "Apr 10", jobs: 139, applications: 9 },
  { date: "Apr 12", jobs: 162, applications: 13 },
];

// TODO: GET /api/upwork/stats/categories
const categoryData = [
  { category: "Full-Stack", count: 523 },
  { category: "AI / ML", count: 412 },
  { category: "Backend", count: 389 },
  { category: "Data Science", count: 274 },
  { category: "Mobile", count: 198 },
  { category: "Frontend", count: 187 },
  { category: "DevOps", count: 143 },
];

// TODO: GET /api/upwork/stats/application-status
const applicationStatus = [
  { name: "Rejected", value: 82, color: "#ef4444" },
  { name: "Pending", value: 38, color: "#f59e0b" },
  { name: "Interview", value: 18, color: "#3b82f6" },
  { name: "Offer", value: 5, color: "#10b981" },
];

// TODO: GET /api/upwork/stats/budget-distribution
const budgetDistribution = [
  { range: "< $500", count: 341 },
  { range: "$500–1k", count: 627 },
  { range: "$1k–5k", count: 894 },
  { range: "$5k–10k", count: 542 },
  { range: "$10k–25k", count: 298 },
  { range: "> $25k", count: 145 },
];

// TODO: GET /api/upwork/stats/top-skills
const topSkills = [
  { skill: "Python", count: 874, pct: 92 },
  { skill: "React", count: 712, pct: 75 },
  { skill: "FastAPI", count: 543, pct: 57 },
  { skill: "PostgreSQL", count: 498, pct: 52 },
  { skill: "TypeScript", count: 471, pct: 50 },
  { skill: "Docker", count: 389, pct: 41 },
  { skill: "LangChain", count: 312, pct: 33 },
  { skill: "Node.js", count: 287, pct: 30 },
];

// TODO: GET /api/upwork/jobs/recent?limit=8
const recentJobs = [
  { id: 1, title: "Senior Full-Stack Developer for SaaS Platform", client: "TechVentures Inc.", budget: "$4,000", type: "Fixed", posted: "2h ago", match: 94, status: "Applied" },
  { id: 2, title: "AI Chatbot Integration with RAG Pipeline", client: "AIStartup LLC", budget: "$85/hr", type: "Hourly", posted: "4h ago", match: 97, status: "Interview" },
  { id: 3, title: "React Admin Dashboard with REST backend", client: "DataViz Co.", budget: "$2,500", type: "Fixed", posted: "6h ago", match: 88, status: "Pending" },
  { id: 4, title: "Python FastAPI Microservices Architecture", client: "CloudSolutions", budget: "$65/hr", type: "Hourly", posted: "8h ago", match: 91, status: "Applied" },
  { id: 5, title: "Web Scraping & Data Pipeline (Playwright)", client: "MarketResearch Co", budget: "$1,800", type: "Fixed", posted: "12h ago", match: 85, status: "Rejected" },
  { id: 6, title: "LLM Fine-tuning & Embedding Pipeline", client: "MLOps Studio", budget: "$95/hr", type: "Hourly", posted: "1d ago", match: 96, status: "Offer" },
  { id: 7, title: "PostgreSQL Database Optimization", client: "FinTech Partners", budget: "$3,200", type: "Fixed", posted: "1d ago", match: 79, status: "Pending" },
  { id: 8, title: "Docker & Kubernetes CI/CD Pipeline Setup", client: "DevAgency Pro", budget: "$2,800", type: "Fixed", posted: "2d ago", match: 82, status: "Applied" },
];

// ---------------------------------------------------------------------------
// KPI Card
// ---------------------------------------------------------------------------

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon, color, trend }) => {
  const theme = useTheme();
  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 3,
        height: "100%",
        background: alpha(color, theme.palette.mode === "dark" ? 0.08 : 0.05),
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": { transform: "translateY(-2px)", boxShadow: `0 8px 24px ${alpha(color, 0.2)}` },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box display="flex" alignItems="center" mt={0.5} gap={0.5}>
                <TrendingUpIcon sx={{ fontSize: 14, color: "#10b981" }} />
                <Typography variant="caption" sx={{ color: "#10b981", fontWeight: 600 }}>
                  {trend}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: alpha(color, 0.15), color, width: 48, height: 48 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );
};

// ---------------------------------------------------------------------------
// SVG Sparkline Area Chart
// ---------------------------------------------------------------------------

interface SparkAreaProps {
  data: { date: string; jobs: number; applications: number }[];
  width?: number;
  height?: number;
}

const SparkAreaChart: React.FC<SparkAreaProps> = ({ data, width = 600, height = 220 }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const padL = 36;
  const padR = 12;
  const padT = 12;
  const padB = 40;
  const W = width - padL - padR;
  const H = height - padT - padB;

  const maxJobs = Math.max(...data.map((d) => d.jobs));
  const xStep = W / (data.length - 1);

  const toX = (i: number) => padL + i * xStep;
  const toY = (v: number, max: number) => padT + H - (v / max) * H;

  const buildPath = (key: "jobs" | "applications", max: number) =>
    data.map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d[key], max).toFixed(1)}`).join(" ");

  const buildArea = (key: "jobs" | "applications", max: number) =>
    `${buildPath(key, max)} L${toX(data.length - 1).toFixed(1)},${(padT + H).toFixed(1)} L${padL},${(padT + H).toFixed(1)} Z`;

  const maxApps = Math.max(...data.map((d) => d.applications));
  const gridLines = 4;
  const gridColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const labelColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id="gJobs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gApps" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {Array.from({ length: gridLines + 1 }).map((_, i) => {
          const y = padT + (H / gridLines) * i;
          const val = Math.round(maxJobs - (maxJobs / gridLines) * i);
          return (
            <g key={i}>
              <line x1={padL} y1={y} x2={padL + W} y2={y} stroke={gridColor} strokeDasharray="3 3" />
              <text x={padL - 4} y={y + 4} textAnchor="end" fontSize={10} fill={labelColor}>
                {val}
              </text>
            </g>
          );
        })}

        <path d={buildArea("jobs", maxJobs)} fill="url(#gJobs)" />
        <path d={buildPath("jobs", maxJobs)} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        <path d={buildArea("applications", maxApps)} fill="url(#gApps)" />
        <path d={buildPath("applications", maxApps)} fill="none" stroke="#10b981" strokeWidth={2.5} />

        {data.map((d, i) =>
          i % 2 === 0 ? (
            <text key={i} x={toX(i)} y={height - 8} textAnchor="middle" fontSize={10} fill={labelColor}>
              {d.date}
            </text>
          ) : null
        )}

        <circle cx={12} cy={height - 20} r={5} fill="#6366f1" />
        <text x={20} y={height - 16} fontSize={10} fill={labelColor}>Jobs Scraped</text>
        <circle cx={110} cy={height - 20} r={5} fill="#10b981" />
        <text x={118} y={height - 16} fontSize={10} fill={labelColor}>Applications</text>
      </svg>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// SVG Donut Chart
// ---------------------------------------------------------------------------

const DonutChart: React.FC<{ data: { name: string; value: number; color: string }[] }> = ({ data }) => {
  const theme = useTheme();
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 80;
  const cy = 80;
  const r = 60;
  const ir = 38;

  let angle = -Math.PI / 2;
  const slices = data.map((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sweep);
    const y2 = cy + r * Math.sin(angle + sweep);
    const ix1 = cx + ir * Math.cos(angle);
    const iy1 = cy + ir * Math.sin(angle);
    const ix2 = cx + ir * Math.cos(angle + sweep);
    const iy2 = cy + ir * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const path = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`,
      `L ${ix2} ${iy2}`,
      `A ${ir} ${ir} 0 ${large} 0 ${ix1} ${iy1}`,
      "Z",
    ].join(" ");
    angle += sweep;
    return { ...d, path };
  });

  return (
    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
      <svg viewBox="0 0 160 160" style={{ width: 160, height: 160, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.path} fill={s.color} stroke={theme.palette.background.paper} strokeWidth={2} />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize={22} fontWeight="bold" fill={theme.palette.text.primary}>
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize={10} fill={theme.palette.text.secondary}>
          total
        </text>
      </svg>
      <Box display="flex" flexDirection="column" gap={1.2} flex={1}>
        {data.map((s) => (
          <Box key={s.name} display="flex" alignItems="center" justifyContent="space-between" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: s.color, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary">{s.name}</Typography>
            </Box>
            <Typography variant="caption" fontWeight={700}>{s.value}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// SVG Horizontal Bar Chart
// ---------------------------------------------------------------------------

const HorizBarChart: React.FC<{ data: { category: string; count: number }[]; color: string }> = ({ data, color }) => {
  const theme = useTheme();
  const max = Math.max(...data.map((d) => d.count));
  return (
    <Box display="flex" flexDirection="column" gap={1.4}>
      {data.map((d) => (
        <Box key={d.category}>
          <Box display="flex" justifyContent="space-between" mb={0.4}>
            <Typography variant="caption" fontWeight={600}>{d.category}</Typography>
            <Typography variant="caption" color="text.secondary">{d.count}</Typography>
          </Box>
          <Box sx={{ height: 8, borderRadius: 4, bgcolor: alpha(color, 0.12), overflow: "hidden" }}>
            <Box
              sx={{
                height: "100%",
                width: `${(d.count / max) * 100}%`,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
                transition: "width 0.6s ease",
              }}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
};

// ---------------------------------------------------------------------------
// SVG Vertical Bar Chart
// ---------------------------------------------------------------------------

const VertBarChart: React.FC<{ data: { range: string; count: number }[]; color: string }> = ({ data, color }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const max = Math.max(...data.map((d) => d.count));
  const barW = 32;
  const gap = 16;
  const H = 160;
  const padB = 32;
  const padL = 8;
  const totalW = data.length * (barW + gap) + padL;
  const labelColor = isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)";

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <svg viewBox={`0 0 ${totalW} ${H + padB}`} style={{ width: "100%", height: "auto", display: "block" }}>
        <defs>
          <linearGradient id="gVBar" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={alpha(color, 0.5)} />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const barH = (d.count / max) * H;
          const x = padL + i * (barW + gap);
          const y = H - barH;
          return (
            <g key={d.range}>
              <rect x={x} y={y} width={barW} height={barH} rx={4} ry={4} fill="url(#gVBar)" />
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize={9} fontWeight="bold" fill={labelColor}>
                {d.count}
              </text>
              <text x={x + barW / 2} y={H + padB - 6} textAnchor="middle" fontSize={9} fill={labelColor}>
                {d.range}
              </text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  Applied: { color: "#3b82f6", icon: <SendIcon sx={{ fontSize: 14 }} /> },
  Interview: { color: "#8b5cf6", icon: <ScheduleIcon sx={{ fontSize: 14 }} /> },
  Offer: { color: "#10b981", icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> },
  Rejected: { color: "#ef4444", icon: <CancelIcon sx={{ fontSize: 14 }} /> },
  Pending: { color: "#f59e0b", icon: <ScheduleIcon sx={{ fontSize: 14 }} /> },
};

const MatchScore: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 90 ? "#10b981" : score >= 75 ? "#3b82f6" : "#f59e0b";
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <LinearProgress
        variant="determinate"
        value={score}
        sx={{
          width: 48,
          height: 6,
          borderRadius: 3,
          bgcolor: alpha(color, 0.2),
          "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
        }}
      />
      <Typography variant="caption" fontWeight={700} sx={{ color, minWidth: 32 }}>
        {score}%
      </Typography>
    </Box>
  );
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Typography variant="h6" fontWeight={700} mb={2} sx={{ letterSpacing: "-0.3px" }}>
    {children}
  </Typography>
);

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export const UpworkDashboard: React.FC = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1400, mx: "auto" }}>
      <Title title="Upwork Dashboard" />

      <Box mb={4}>
        <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
          Upwork Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Jobs scraped, tracked, and analyzed — powered by your RAG pipeline.
        </Typography>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={4}>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard title="Jobs Scraped" value={summaryStats.totalJobsScraped.toLocaleString()} subtitle="All time" icon={<WorkIcon />} color="#6366f1" trend="+12% this week" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard title="Applications Sent" value={summaryStats.applicationsSent} subtitle="Last 30 days" icon={<SendIcon />} color="#3b82f6" trend="+8 this week" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard title="Response Rate" value={`${summaryStats.responseRate}%`} subtitle="Replies / sent" icon={<TrendingUpIcon />} color="#10b981" trend="+4.1% vs last mo." />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard title="Avg. Budget" value={`$${summaryStats.avgBudget.toLocaleString()}`} subtitle="Fixed + hourly" icon={<AttachMoneyIcon />} color="#f59e0b" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard title="Active Proposals" value={summaryStats.activeProposals} subtitle="Awaiting reply" icon={<ScheduleIcon />} color="#8b5cf6" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <StatCard title="Offers Received" value={summaryStats.offersReceived} subtitle="This month" icon={<StarIcon />} color="#ec4899" trend="New this week!" />
        </Grid>
      </Grid>

      {/* Row 1: Sparkline + Donut */}
      <Grid container spacing={2.5} mb={4}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle>Jobs Scraped & Applications — Last 30 Days</SectionTitle>
              <SparkAreaChart data={jobsOverTime} />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle>Application Status</SectionTitle>
              <DonutChart data={applicationStatus} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 2: Category bars + Budget bars */}
      <Grid container spacing={2.5} mb={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle>Jobs by Category</SectionTitle>
              <HorizBarChart data={categoryData} color="#6366f1" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle>Budget Distribution</SectionTitle>
              <VertBarChart data={budgetDistribution} color="#8b5cf6" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 3: Recent Jobs + Top Skills */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle>Recent Jobs</SectionTitle>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["Job Title", "Budget", "Match", "Status", "Posted"].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 700, fontSize: 12, color: "text.secondary", border: 0, pb: 1 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentJobs.map((job) => {
                      const sc = statusConfig[job.status] ?? statusConfig["Pending"];
                      return (
                        <TableRow
                          key={job.id}
                          sx={{ "&:hover": { bgcolor: alpha(theme.palette.action.hover, 0.04) } }}
                        >
                          <TableCell sx={{ border: 0, py: 1.5 }}>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 280 }}>
                              {job.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{job.client}</Typography>
                          </TableCell>
                          <TableCell sx={{ border: 0, py: 1.5 }}>
                            <Typography variant="body2" fontWeight={600}>{job.budget}</Typography>
                            <Typography variant="caption" color="text.secondary">{job.type}</Typography>
                          </TableCell>
                          <TableCell sx={{ border: 0, py: 1.5 }}>
                            <MatchScore score={job.match} />
                          </TableCell>
                          <TableCell sx={{ border: 0, py: 1.5 }}>
                            <Chip
                              label={job.status}
                              size="small"
                              icon={sc.icon as React.ReactElement}
                              sx={{
                                bgcolor: alpha(sc.color, 0.12),
                                color: sc.color,
                                fontWeight: 600,
                                fontSize: 11,
                                "& .MuiChip-icon": { color: sc.color },
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ border: 0, py: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">{job.posted}</Typography>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <SectionTitle>Top Skills in Demand</SectionTitle>
              <Box display="flex" flexDirection="column" gap={2}>
                {topSkills.map((s) => (
                  <Box key={s.skill}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="body2" fontWeight={600}>{s.skill}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.count.toLocaleString()} · {s.pct}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={s.pct}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha("#6366f1", theme.palette.mode === "dark" ? 0.15 : 0.1),
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 3,
                          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                        },
                      }}
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
