import express from "express";
import incidentRoutes from "./routes/incidentRoutes";
import userRoutes from "./routes/userRoutes";
import { errorHandlerMiddleware } from "./middleware/errorHandlerMiddleware";
import { loggerMiddleware } from "./middleware/loggerMiddleware";
import { notFoundMiddleware } from "./middleware/notFoundMiddleware";

const app = express();

app.use(express.json());
app.use(loggerMiddleware);

app.use("/api/users", userRoutes);
app.use("/api/incidents", incidentRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
