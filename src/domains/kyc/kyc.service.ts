import { KYCResponse } from "./kyc.interface";
import KYCVerificationService from "../../kyc-verifications/kyc-verifications.service";
import KYC from "../../models/kyc";
import { throwError } from "../../helpers/throw-error";

class KYCService {
  constructor(
    private readonly kycVerificationService: typeof KYCVerificationService
  ) {}

  public async verifyBVNWithFace(
    userId: string,
    bvn: string,
    image: string
  ): Promise<KYCResponse> {
    const provider = "prembly";

    const isVerified = await KYC.findOne({
      where: { userId, provider },
    });

    if (isVerified) throwError(400, "BVN already verified");

    const response = await this.kycVerificationService.verifyBVNWithFace(
      bvn,
      image,
      provider
    );

    // Save the response to DB
    if (response.success && response.status === 200) {
      await KYC.create({
        userId,
        provider,
        submittedData: response.submitted_data,
        providerResponse: response.response,
      });
    }

    return response;
  }
}

export default new KYCService(KYCVerificationService);
