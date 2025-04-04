import { Request, Response } from "express";
import UserService from "./user.service";
import { asyncHandler } from "../helpers/async-handler";
import { buildResponse } from "../helpers/build-response";

const { sendSuccessRes } = buildResponse;

class UserController {
  constructor(private readonly userService: typeof UserService) {}

  public createUser = asyncHandler(async (req, res) => {
    const user = await this.userService.createUser(req.body);
    sendSuccessRes({
      res,
      statusCode: 201,
      message:
        "User created successfully, please check your email to verify your account",
      data: user,
    });
  });

  public verifyEmail = asyncHandler(async (req, res) => {
    const response = await UserService.verifyEmail(req);
    sendSuccessRes({
      res,
      statusCode: 200,
      message: "Email verified successfully",
      data: response,
    });
  });

  public login = asyncHandler(async (req, res) => {
    const user = await this.userService.login(req.body);
    sendSuccessRes({
      res,
      message: "Login successful",
      data: user,
    });
  });

  public forgotPassword = asyncHandler(async (req, res) => {
    const response = await this.userService.forgotPassword(req.body.email);
    sendSuccessRes({
      res,
      message: "Password reset email sent",
      data: response,
    });
  });

  public resetPassword = asyncHandler(async (req, res) => {
    const response = await this.userService.resetPassword(req.body);
    sendSuccessRes({
      res,
      message: "Password reset successfully",
      data: response,
    });
  });

  public changePassword = asyncHandler(async (req, res) => {
    const response = await this.userService.changePassword(req, req.body);
    sendSuccessRes({
      res,
      message: "Password changed successfully",
      data: response,
    });
  });
}

export default new UserController(UserService);
