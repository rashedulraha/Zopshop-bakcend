import { app } from "./app.js";
import { config } from "./config/config.js";

const port = config.port || 8000;

app.listen(port, () => {
  console.log(`Server is running port number ${port}`);
});
