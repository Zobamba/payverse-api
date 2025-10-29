import User from "../domains/user/user.model";
import { generateVerificationCode, storeCode } from "../utils/code";
import { sendVerificationCode } from "../utils/email";

export async function handleEmailMFA(user: User): Promise<void> {
  const verificationCode = generateVerificationCode();
  await sendVerificationCode(user.email, user.firstName, verificationCode);
  await storeCode(user.id, "email", verificationCode, 10);
}
