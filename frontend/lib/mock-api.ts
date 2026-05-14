import {
  activity,
  aiSummary,
  analytics,
  authMoments,
  automations,
  businessProfile,
  channelPerformance,
  clients,
  metrics,
  quickActions,
  textThreads,
  transcript,
  voiceCalls
} from "@/lib/mock-data";

export type WorkspaceData = {
  businessProfile: typeof businessProfile;
  authMoments: typeof authMoments;
  metrics: typeof metrics;
  channelPerformance: typeof channelPerformance;
  activity: typeof activity;
  quickActions: typeof quickActions;
  aiSummary: typeof aiSummary;
  voiceCalls: typeof voiceCalls;
  textThreads: typeof textThreads;
  clients: typeof clients;
  automations: typeof automations;
  analytics: typeof analytics;
  transcript: typeof transcript;
};

export async function getWorkspaceData(): Promise<WorkspaceData> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  return {
    businessProfile,
    authMoments,
    metrics,
    channelPerformance,
    activity,
    quickActions,
    aiSummary,
    voiceCalls,
    textThreads,
    clients,
    automations,
    analytics,
    transcript
  };
}
