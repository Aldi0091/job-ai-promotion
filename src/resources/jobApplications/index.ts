import { JobApplicationsList, JobApplicationCreate, JobApplicationEdit, JobApplicationShow } from "./views";

export const jobApplicationsResource = {
  name: "job-applications",
  list: JobApplicationsList,
  create: JobApplicationCreate,
  edit: JobApplicationEdit,
  show: JobApplicationShow,
  options: { label: "Job Tracker" },
};
