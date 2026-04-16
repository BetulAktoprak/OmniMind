import type { AccountPreferences } from "../types/preferences";
import { http } from "./http";

function normPrefs(raw: Record<string, unknown>): AccountPreferences {
  return {
    allowAiJournalAnalysis: Boolean(
      raw.allowAiJournalAnalysis ?? raw.AllowAiJournalAnalysis
    ),
    personalizedRecommendations: Boolean(
      raw.personalizedRecommendations ?? raw.PersonalizedRecommendations
    ),
  };
}

export async function getAccountPreferencesApi() {
  const res = await http.get<Record<string, unknown>>("/api/Account/MyPreferences");
  return normPrefs(res.data);
}

export async function updateAccountPreferencesApi(body: AccountPreferences) {
  await http.put("/api/Account/UpdatePreferences", body);
}
