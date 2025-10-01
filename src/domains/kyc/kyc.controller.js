"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const async_handler_1 = require("../../helpers/async-handler");
const build_response_1 = require("../../helpers/build-response");
const kyc_service_1 = __importDefault(require("./kyc.service"));
const { sendSuccessRes } = build_response_1.buildResponse;
class KYCController {
    kycService;
    constructor(kycService) {
        this.kycService = kycService;
    }
    verifyBVNWithFace = (0, async_handler_1.asyncHandler)(async (req, res) => {
        const { bvn, image } = req.body;
        const userId = req.user.id;
        const response = await this.kycService.verifyBVNWithFace(userId, bvn, image);
        return sendSuccessRes({
            res,
            data: response,
            message: response.message || "BVN verification failed",
        });
    });
}
exports.default = new KYCController(kyc_service_1.default);
