import AuthService from "./auth.service";
import { asyncHandler } from "../../helpers/async-handler";
import { buildResponse } from "../../helpers/build-response";

const { sendSuccessRes } = buildResponse;

class AuthController {
  constructor(private readonly authService: typeof AuthService) {}

  public register = asyncHandler(async (req, res) => {
    const user = await this.authService.register(req.body);
    sendSuccessRes({
      res,
      statusCode: 201,
      message:
        "User created successfully, please check your email to verify your account",
      data: user,
    });
  });

  public verifyEmail = asyncHandler(async (req, res) => {
    const response = await this.authService.verifyEmail(req);
    sendSuccessRes({
      res,
      statusCode: 200,
      message: "Email verified successfully",
      data: response,
    });
  });

  public login = asyncHandler(async (req, res) => {
    const response = await this.authService.login(req.body);
    sendSuccessRes({
      res,
      message: "Login successful, verify MFA",
      data: response,
    });
  });

    public verifyMFA = asyncHandler(async (req, res) => {
    const { mfaToken, mfaType, code } = req.body;

    const data = await this.authService.verifyMFA({ mfaToken, mfaType, code });
    sendSuccessRes({
      res,
      message: "MFA verified successfully",
      data,
    });
  });

  public forgotPassword = asyncHandler(async (req, res) => {
    const response = await this.authService.forgotPassword(req.body.email);
    sendSuccessRes({
      res,
      message: "Password reset email sent",
      data: response,
    });
  });

  public resetPassword = asyncHandler(async (req, res) => {
    const response = await this.authService.resetPassword(req.body);
    sendSuccessRes({
      res,
      message: "Password reset successfully",
      data: response,
    });
  });

  public changePassword = asyncHandler(async (req, res) => {
    const response = await this.authService.changePassword({
      ...req.body,
      userId: (req as any).user.id,
    });
    sendSuccessRes({
      res,
      message: "Password changed successfully",
      data: response,
    });
  });

  public refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    const data = await this.authService.refreshAccessToken(refreshToken);

    sendSuccessRes({
      res,
      message: "Token refreshed successfully",
      data,
    });
  });
}

export default new AuthController(AuthService);
