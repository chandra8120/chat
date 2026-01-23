import express from "express";

import userAuthRouter from "./user.router.js";
import cordinatesRouter from "./cordinates.route.js";
import pageRouter from "./page.route.js";

const app = express();

app.use("/user",userAuthRouter);

app.use("/cordinates",cordinatesRouter);

app.use("/page",pageRouter)

export default app;