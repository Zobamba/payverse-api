import Token from "./token.model";
import { CreateTokenData } from "./token.interface";

class TokenService {
  public async createToken(data: CreateTokenData) {
    const { userId, token, type, expiresAt } = data;
    return Token.create({ userId, token, type, expiresAt });
  }

  public async findByToken(token: string) {
    return Token.findOne({ where: { token } });
  }
}

export default new TokenService();
