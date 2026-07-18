import { config } from "../../config/config.js";
import type { ResendInterfaces } from "./resend.interfaces.js";
import { Resend } from "resend";

const resend = new Resend(config.resend_api_key);

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
