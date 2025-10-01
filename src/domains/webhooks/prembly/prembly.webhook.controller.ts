import PremblyWebhookService from "./prembly.webhook.service";
import { asyncHandler } from "../../../helpers/async-handler";
import { buildResponse } from "../../../helpers/build-response";

const { sendSuccessRes } = buildResponse;

class PremblyWebhookController {
  constructor(
    private readonly premblyWebhookService: typeof PremblyWebhookService
  ) {}

  public processWebhook = asyncHandler(async (req, res) => {
    const result = await this.premblyWebhookService.processWebhook(req.body);
    sendSuccessRes({
      res,
      message: "Webhook processed successfully",
      data: result,
    });
  });
}

export default new PremblyWebhookController(PremblyWebhookService);
