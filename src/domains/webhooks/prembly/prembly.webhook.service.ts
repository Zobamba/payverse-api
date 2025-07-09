import KYC from "../../../models/kyc";
import {
  PremblyWebhookPayload,
  PremblyWebhookResponse,
} from "./prembly.webhook.interface";

class PremblyWebhookService {
  public async processWebhook(
    payload: PremblyWebhookPayload
  ): Promise<PremblyWebhookResponse> {
    console.log("Received Prembly Webhook:", payload);

    switch (payload?.event) {
      case "verification.completed":
        return this.handleVerificationCompleted(payload.data);

      default:
        console.warn("Unhandled event:", payload?.event);
        return {
          status: false,
          detail: "Unhandled event type",
          response_code: "400",
          data: null,
        };
    }
  }

  private async handleVerificationCompleted(
    data: any
  ): Promise<PremblyWebhookResponse> {
    const { service_type, result } = data;

    if (service_type !== "bvn-face-match") {
      return {
        status: true,
        detail: "Unsupported verification type",
        response_code: "00",
        data: null,
      };
    }

    const { bvn_data } = result;
    const bvn = bvn_data?.bvn;

    const existingKYC = await KYC.findOne({
      where: {
        provider: "prembly",
        submittedData: {
          identity_type: "bvn",
          identity_value: bvn,
        },
      },
    });

    if (!existingKYC) {
      return {
        status: false,
        detail: "No matching KYC entry found for this BVN",
        response_code: "404",
        data: { bvn },
      };
    }

    return {
      status: true,
      detail: "Verification Successful",
      response_code: "200",
      data: {
        userId: existingKYC.userId,
      },
    };
  }
}

export default new PremblyWebhookService();
