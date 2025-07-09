export interface PremblyWebhookPayload {
  event: string;
  data: any;
}

export interface PremblyWebhookResponse {
  status: boolean;
  detail: string;
  response_code: string;
  data: any;
}