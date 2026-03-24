/** Axios hatalarını journal.api içinde sarmalarken HTTP kodunu korur (ör. 401). */
export class ApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
