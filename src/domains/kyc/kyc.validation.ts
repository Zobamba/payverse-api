import { z } from "zod";
import { validateWithZod } from "../../middlewares/form-validate";

export const validateBVNWithFace = validateWithZod(
  z.object({
    body: z.object({
      bvn: z.string().min(1, { message: "BVN is required" }),
      image: z.string().min(1, { message: "Image is required" }),
    }),
  })
);
