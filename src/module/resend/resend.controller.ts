import type { Request, Response } from "express";
import { resendService } from "./resend.service.js";

const payload = {
  from: "Acme <onboarding@resend.dev>",
  to: ["delivered@resend.dev"],
  subject: "hello world",
  html: "<strong>it works!</strong>",
};

const resend = async (req: Request, res: Response) => {
  const { data, error } = await resendService.resendEmail(payload);

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json({ data });
};

export const ResendControllers = {
  resend,
};
