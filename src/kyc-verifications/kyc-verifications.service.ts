import type { KYCResponse } from "../domains/kyc/kyc.interface";
import { IdentityProvider } from "../domains/kyc/kyc.interface";
import PremblyService from "./prembly/prembly.service";

class KYCVerificationService {
  constructor(private readonly premblyService: typeof PremblyService) {}

  public async verifyBVNWithFace(
    bvn: string,
    image: string,
    provider: IdentityProvider
  ): Promise<KYCResponse> {
    switch (provider) {
      case "prembly":
        return this.premblyService.BVNWithFace(bvn, image);
      default:
        throw new Error("Provider not supported");
    }
  }
}

export default new KYCVerificationService(PremblyService);
