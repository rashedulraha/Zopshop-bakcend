import express, {
  type Application,
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authRoute } from "./module/auth/auth.route.js";
import { ResendRouter } from "./module/resend/resend.route.js";
import { meRouter } from "./module/me/me.route.js";
import { signoutRoute } from "./module/signout/signout.route.js";

export const app: Application = express();

//* middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello - server is running - Rashedul -" });
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

// api route
app.use("/api/auth", authRoute);

// resend api
app.use("/api/resend", ResendRouter);
// get me
app.use("/api/me", meRouter);
//  sign out user
app.use(
  "/api/signout",
  (req: Request, res: Response, next: NextFunction) => {
    console.log("Logout this route clicked");
    next();
  },
  signoutRoute,
);
