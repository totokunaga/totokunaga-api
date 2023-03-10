import app from "./src/api/app";
import { AppDataSource } from "./src/db/orm";

const PORT = 4000;

app.listen(PORT, async () => {
  try {
    await AppDataSource.initialize();
    console.log(`Listening to client PORT ${PORT}`);
  } catch (e: any) {
    console.error("Failed to connect to the database:", e.message);
  }
});
