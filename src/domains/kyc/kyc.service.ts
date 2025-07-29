import { KYCResponse } from "./kyc.interface";
import KYCVerificationService from "../../kyc-verifications/kyc-verifications.service";
import KYC from "../../models/kyc";
import UserTier from "../../models/user-tier";
import TierLevel from "../../models/tier-level";
import { throwError } from "../../helpers/throw-error";
import logger from "../../helpers/logger";
import { Op } from "sequelize";
import sequelize from "../../config/database";

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

    const latestTierInstance = await UserTier.findOne({
      where: { userId },
      include: [{ model: TierLevel, as: "tier" }],
      order: [["assignedAt", "DESC"]],
    });

    const latestTier = latestTierInstance?.get({ plain: true });

    if (!latestTier) throwError(400, "User tier not assigned");

    const userTierLevel = latestTier.tier?.level;
    if (userTierLevel !== 0) {
      throwError(403, "You have already completed KYC");
    }

    // Call external provider before entering transaction
    const response = await this.kycVerificationService.verifyBVNWithFace(
      bvn,
      image,
      provider
    );

    if (
      !response.success ||
      response.status !== 200 ||
      response.submitted_data.identity_type !== "bvn"
    ) {
      return response;
    }

    const submittedBVN = response.submitted_data.identity_value;
    const returnedBVN = response.response.user_info.bvn;

    if (submittedBVN !== returnedBVN) {
      throwError(400, "BVN mismatch. Please check and try again.");
    }

    // Begin transaction
    const transaction = await sequelize.transaction();

    try {
      // Count BVN usage with row lock to prevent race conditions
      const bvnRecords = await KYC.findAll({
        where: {
          provider,
          userId,
          [Op.and]: [
            { submittedData: { identity_type: "bvn" } },
            { submittedData: { identity_value: bvn } },
          ],
        },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (bvnRecords.length >= 3) {
        throwError(
          400,
          "This BVN has been used too many times. Please contact support."
        );
      }

      // Save KYC
      await KYC.create(
        {
          userId,
          provider,
          submittedData: response.submitted_data,
          providerResponse: response.response,
        },
        { transaction }
      );

      const tierInstance = await TierLevel.findOne({
        where: { level: 1 },
        transaction,
      });

      const tierOne = tierInstance?.get({ plain: true });

      if (tierOne) {
        await UserTier.create(
          {
            userId,
            tierId: tierOne.id,
            assignedAt: new Date(),
            reasonForChange: "KYC verification passed",
          },
          { transaction }
        );
      }

      await transaction.commit();
      return response;
    } catch (err) {
      await transaction.rollback();
      logger?.error?.(`KYC failed for user ${userId}`, { error: err });
      throw err;
    }
  }
}

export default new KYCService(KYCVerificationService);
