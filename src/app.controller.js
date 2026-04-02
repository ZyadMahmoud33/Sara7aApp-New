import connectDB from "./DB/conecctions.js";
import { authRouter , userRouter } from "./Modules/index.js";
import {
    globalErorrHandler,
    NotFoundException,
} from "./Utlis/response/error.response.js";
import { successResponse } from "./Utlis/response/succes.response.js";

const bootstrap = async (app, express) => {
    app.use(express.json());
    await connectDB();
    app.get("/", (req, res) => {
        return successResponse({
            res,
            statusCode: 201,
            message: "Hello From Success Response",
        });
    });
    app.use("/auth", authRouter);
    app.use("/user", userRouter);


    app.all("/*dummy", (req, res) => {
       throw NotFoundException ({message: "not found Handler!!"})
    });

    app.use(globalErorrHandler);
};

export default bootstrap;