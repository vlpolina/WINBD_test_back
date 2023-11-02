import express from "express";
import cors from "cors";
import router from "./router.js";

const PORT = process.env.PORT || 3011;
const app = express();

/*app.use(
  cors({
    origin: [
      ["http://localhost:3011"],
      ["http://localhost:63342"],
      ["https://winbd-test-back.vercel.app/"],
    ],
  })
);*/
app.use(express.json());
app.use("/", router);

app.listen(PORT, () => console.log("Server started on port " + PORT));

module.exports = app;
