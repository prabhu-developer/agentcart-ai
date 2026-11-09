import { AgentRequest, AgentResponse } from "../schemas/agent-contracts";

export async function sendShoppingInquiry(
  payload: AgentRequest
): Promise<AgentResponse> {
  const response = await fetch("/api/ai/shopping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as AgentResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.error || `AI shopping assistant failed with status: ${response.status}`);
  }

  return data;
}
