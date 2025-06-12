import MFAService from "./mfa.service";
import { asyncHandler } from "../../helpers/async-handler";
import { buildResponse } from "../../helpers/build-response";

const { sendSuccessRes } = buildResponse;

class MFAController {
  constructor(private readonly mfaService: typeof MFAService) {}

  public enableMFA = asyncHandler(async (req, res) => {
    const { mfaType, value } = req.body;
    const userId = (req as any).user.id;

    const result = await this.mfaService.enableMFA({ userId, mfaType, value });
    sendSuccessRes({
      res,
      message: "MFA setup initiated",
      data: result,
    });
  });
}

export default new MFAController(MFAService);
