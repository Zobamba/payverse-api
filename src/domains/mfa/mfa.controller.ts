import MFAService from "./mfa.service";
import { asyncHandler } from "../../helpers/async-handler";
import { buildResponse } from "../../helpers/build-response";

const { sendSuccessRes } = buildResponse;

class MFAController {
  constructor(private readonly mfaService: typeof MFAService) { }

  public enableMFA = asyncHandler(async (req: any, res) => {
    const userId = req.user.id;
    const result = await this.mfaService.setupTotp({ userId, ...req.body });
    sendSuccessRes({
      res,
      message: "MFA setup initiated",
      data: result,
    });
  });
}

export default new MFAController(MFAService);
