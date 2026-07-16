import { toNodeHandler } from "better-auth/node";
import { app } from "../../app.js";
import { auth } from "../../lib/auth.js";

app.all("/api/auth/*", toNodeHandler(auth));
