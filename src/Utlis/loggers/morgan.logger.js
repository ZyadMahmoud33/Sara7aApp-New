import fs from "fs";
import path from "path";
import morgan from "morgan";

const __direname = path.resolve();

// export function attachRouterWithLogger(app, routerPath, router, logFileName) {
//     const logStream = fs.createWriteStream(
//         path.join(__direname, "./src/logger", logFileName),
//         { flags: "a" },
//     );

//     app.use(routerPath, morgan("combined", { stream: logStream }), router);
//     app.use(routerPath, morgan("dev"), router);
export function attachRouterWithLogger(app, routerPath, router, logFileName) {
    // لغينا الـ logStream خالص لأنه بيسبب error: EROFS على فيرسيل
    
    // هنخلي morgan يطبع في الـ console بس
    app.use(routerPath, morgan("dev"), router);
};

