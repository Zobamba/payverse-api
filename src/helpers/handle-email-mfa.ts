import User from "../models/user";
import { generateVerificationCode, storeCode } from "../utils/code";
import { sendVerificationCode } from "../utils/email";

export async function handleEmailMFA(user: User): Promise<void> {
  const verificationCode = generateVerificationCode();
  await sendVerificationCode(user, verificationCode);
  await storeCode(user.id, "email", verificationCode, 10);
}
