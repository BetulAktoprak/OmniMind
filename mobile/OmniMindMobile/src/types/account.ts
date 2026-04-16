export type RequestAccountDeletionRequest = {
  password: string;
};

export type RequestAccountDeletionResponse = {
  purgeAfterUtc: string;
  message: string;
};
