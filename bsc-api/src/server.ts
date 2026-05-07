import "dotenv/config";
import app from "./app";

const PORT = parseInt(process.env.PORT || "3000", 10);

app.listen(PORT, () => {
  console.log(`BSC API server running on port ${PORT}`);
});