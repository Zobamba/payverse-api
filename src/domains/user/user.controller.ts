import UserService from "./user.service";
import { asyncHandler } from "../../helpers/async-handler";
import { buildResponse } from "../../helpers/build-response";

const { sendSuccessRes } = buildResponse;

class UserController {
  constructor(private readonly userService: typeof UserService) {}

  public getProfile = asyncHandler(async (req, res) => {
    const user = await this.userService.getProfile((req as any).user.id);
    sendSuccessRes({
      res,
      message: "User profile retrieved successfully",
      data: user,
    });
  });

  public getUserById = asyncHandler(async (req, res) => {
    const user = await this.userService.getUserById(req.params.id);
    sendSuccessRes({
      res,
      message: "User retrieved successfully",
      data: user,
    });
  });

  public getAllUsers = asyncHandler(async (req, res) => {
    const users = await this.userService.getAllUsers();
    sendSuccessRes({
      res,
      message: "Users retrieved successfully",
      data: users,
    });
  });

  public updateProfile = asyncHandler(async (req, res) => {
    const updated = await this.userService.updateProfile(
      (req as any).user.id,
      req.body
    );
    sendSuccessRes({
      res,
      message: "Profile updated successfully",
      data: updated,
    });
  });

  public deleteAccount = asyncHandler(async (req, res) => {
    await this.userService.deleteAccount((req as any).user.id);
    sendSuccessRes({
      res,
      message: "Account deleted successfully",
      data: null,
    });
  });
}

export default new UserController(UserService);
