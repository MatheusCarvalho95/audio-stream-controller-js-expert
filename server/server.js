import { handler } from "./routes.js";
import { createServer } from "http";

export default createServer(handler);
