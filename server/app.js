import express from "express";
import cors from "cors";
import signupRouter from "./routes/signupRouter.js";
import loginRouter from "./routes/loginRouter.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", signupRouter);
app.use("/api", loginRouter);

app.use(errorHandler);

export default app;
