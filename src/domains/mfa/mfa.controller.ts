import MFAService from "./mfa.service";
import { asyncHandler } from "../../helpers/async-handler";
import { buildResponse } from "../../helpers/build-response";
import { Request, Response } from "express";

const { sendSuccessRes } = buildResponse;

class MFAController {
  constructor(private readonly mfaService: typeof MFAService) {}

  public setupTotp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = (req as any).user.id;
      const result = await this.mfaService.setupTotp({ userId, ...req.body });
      sendSuccessRes({
        res,
        message: "MFA setup initiated",
        data: result,
      });
    }
  );

  public completeTotpSetup = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = (req as any).user.id;
      await this.mfaService.completeTotpSetup(userId);
      sendSuccessRes({
        res,
        message: "MFA setup completed",
        data: [],
      });
    }
  );

  public verifyTotp = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const userId = (req as any).user.id;
      const { code, mfaType } = req.body;
      const isVerified = await this.mfaService.verifyTotp(
        code,
        userId,
        mfaType
      );
      sendSuccessRes({
        res,
        message: "TOTP verification completed",
        data: { isVerified },
      });
    }
  );
}

export default new MFAController(MFAService);
