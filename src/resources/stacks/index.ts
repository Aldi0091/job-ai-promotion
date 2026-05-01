import { StacksList, StackCreate, StackEdit } from "./views";

export const stacksResource = {
  name: "stacks",
  list: StacksList,
  create: StackCreate,
  edit: StackEdit,
  options: { label: "Stacks" },
};
