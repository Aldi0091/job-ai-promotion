// src/resources/upworkJobs/index.ts
import { UpworkJobsList } from "./list";
import { UpworkJobShow } from "./show";

export const upworkJobsResource = {
  name: "upwork-jobs",
  list: UpworkJobsList,
  show: UpworkJobShow,
};
