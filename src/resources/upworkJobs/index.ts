// src/resources/upworkJobs/index.ts
import { UpworkJobsList } from "./list";
import { UpworkJobShow } from "./show";
import { UpworkFavoritesList } from "./favorites";

export const upworkJobsResource = {
  name: "upwork-jobs",
  list: UpworkJobsList,
  show: UpworkJobShow,
  options: { label: "Upwork Jobs List" },
};

export const upworkFavoritesResource = {
  name: "upwork-jobs-favorites",
  list: UpworkFavoritesList,
  options: { label: "Favorites" },
};
