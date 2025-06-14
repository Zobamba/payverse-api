import { asyncHandler } from "../../helpers/async-handler";
import { buildResponse } from "../../helpers/build-response";
import KYCService from "./kyc.service";

const { sendSuccessRes } = buildResponse;

class KYCController {
  constructor(private readonly kycService: typeof KYCService) {}

  public verifyBVNWithFace = asyncHandler(async (req, res) => {
    const { bvn, image } = req.body;
    const userId = (req as any).user.id;
    const response = await this.kycService.verifyBVNWithFace(
      userId,
      bvn,
      image
    );

    return sendSuccessRes({
      res,
      data: response,
      message: response.message || "BVN verification failed",
    });
  });
}

export default new KYCController(KYCService);
