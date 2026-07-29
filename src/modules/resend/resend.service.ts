import { config } from "../../config/index.js";
import type { ResendInterfaces } from "./resend.interfaces.js";
import { Resend } from "resend";

const resend = new Resend(config.RESEND_API_KEY || "re_dummy_key");

const resendEmail = async (payload: ResendInterfaces) => {
  const { data, error } = await resend.emails.send({
    from: "Acme <onboarding@resend.dev>",
    to: ["delivered@resend.dev"],
    subject: "hello world",
    html: "<strong>it works!</strong>",
  });

  return {
    data,
    error,
  };
};

export const resendService = {
  resendEmail,
};
