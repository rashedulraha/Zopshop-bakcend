import { app } from "./app.js";
import { config } from "./config/index.js";
import { adapter } from "./lib/prisma.js";
import { PrismaClient } from "../generated/prisma/client.js";

const prisma = new PrismaClient({ adapter });

const startServer = async () => {
  try {
    // Check Database connection
    await prisma.$connect();
    console.log("✅ Successfully connected to the database.");

    // Start Express server
    const port = config.PORT;
    const server = app.listen(port, () => {
      console.log(`🚀 Server is running in ${config.NODE_ENV} mode on port ${port}`);
    });

    // Graceful Shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM received. Shutting down gracefully...");
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error("❌ Failed to start the server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
