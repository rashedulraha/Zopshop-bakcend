import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT,
  zop_shop_trust_origin: process.env.ZOPSHOP_TRUST_ORIGIN,
  resend_api_key: process.env.RESEND_API_KEY,
};
