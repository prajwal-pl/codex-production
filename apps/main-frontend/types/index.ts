import { z } from "zod";

export const authSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name must be at most 50 characters." })
    .optional(),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6).max(100),
});
