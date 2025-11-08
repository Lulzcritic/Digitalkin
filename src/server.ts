import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
