export type UpdateStoreSettingsState = {
  message: string;
  status: "error" | "idle" | "success";
};

export const initialUpdateStoreSettingsState: UpdateStoreSettingsState = {
  message: "",
  status: "idle",
};
