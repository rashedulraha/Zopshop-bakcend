import express, {
  type Application,
  type Request,
  type Response,
} from "express";

export const app: Application = express();

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello - server is running" });
});
