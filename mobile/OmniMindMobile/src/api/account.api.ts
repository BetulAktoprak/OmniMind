import type {
  RequestAccountDeletionRequest,
  RequestAccountDeletionResponse,
} from "../types/account";
import { http } from "./http";

export async function requestAccountDeletionApi(
  data: RequestAccountDeletionRequest
) {
  const res = await http.post<RequestAccountDeletionResponse>(
    "/api/Account/RequestDeletion",
    data
  );
  return res.data;
}
