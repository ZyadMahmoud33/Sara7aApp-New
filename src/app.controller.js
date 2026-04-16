import connectDB from "./DB/conecctions.js";
import { connectRedis } from "./DB/redis.connection.js";
import { authRouter , userRouter } from "./Modules/index.js";
import {
    globalErorrHandler,
    NotFoundException,
} from "./Utlis/response/error.response.js";
import { successResponse } from "./Utlis/response/succes.response.js";
import cors from "cors";
import path from "node:path";

const bootstrap = async (app, express) => {
    app.use(express.json() , cors());

    await connectDB();
    await connectRedis();

    app.get("/", (req, res) => {
        return successResponse({
            res,
            statusCode: 201,
            message: "Hello From Success Response",
        });
    });

    app.use("/api/auth", authRouter);
    app.use("/api/user", userRouter);
    app.use("/uploads", express.static(path.resolve("./src/uploads")));
    app.all("/*dummy", (req, res) => {
       throw NotFoundException ({message: "not found Handler!!"})
    });

    app.use(globalErorrHandler);
};

export default bootstrap;