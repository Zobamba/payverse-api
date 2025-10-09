import Token from "./token.model";
import { CreateTokenData } from "./token.interface";
import { signJsonWebToken, parseExpiry } from "../../utils/auth";

class TokenService {
  public async createToken(data: CreateTokenData) {
    const { userId, token, type, expiresAt } = data;
    return Token.create({ userId, token, type, expiresAt });
  }

  public async findByToken(token: string) {
    return Token.findOne({ where: { token } });
  }

  public async generateTokens(userId: string) {
    // Use longer expiry in development for easier testing
    const accessTokenExpiry =
      process.env.ENVIRONMENT === "development"
        ? "7d"
        : process.env.JWT_ACCESS_TOKEN_EXPIRY;

    const accessToken = signJsonWebToken({ id: userId }, accessTokenExpiry);
    const refreshToken = signJsonWebToken(
      { id: userId },
      process.env.JWT_REFRESH_TOKEN_EXPIRY
    );

    await this.createToken({
      userId,
      token: refreshToken,
      type: "refresh",
      expiresAt: new Date(
        Date.now() + parseExpiry(process.env.JWT_REFRESH_TOKEN_EXPIRY!)
      ),
    });

    return { accessToken, refreshToken };
  }
}

export default new TokenService();
