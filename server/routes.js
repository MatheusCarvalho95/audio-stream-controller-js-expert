import config from "./config.js";
import { logger } from "./utils.js";
import { Controller } from "./controller.js";

const {
  location,
  pages: { homeHTML, controllerHTML },
  constants: { CONTENT_TYPE },
} = config;
const controller = new Controller();
async function routes(request, response) {
  const { method, url } = request;

  if (method === "GET" && url === "/") {
    response.writeHead(302, {
      Location: location.home,
    });
    return response.end();
  }
  if (method === "GET" && url === "/home") {
    const { stream } = await controller.getFileStream(homeHTML);
    return stream.pipe(response);
  }

  if (method === "GET" && url === "/controller") {
    const { stream } = await controller.getFileStream(controllerHTML);
    return stream.pipe(response);
  }
  if (method === "GET") {
    const { stream, type } = await controller.getFileStream(url);
    if (!!CONTENT_TYPE[type])
      response.writeHead(200, { "Content-Type": CONTENT_TYPE[type] });
    return stream.pipe(response);
  }
  response.writeHead(404);
  return response.end();
}

function handleError(response, err) {
  if (err.message.includes("ENOENT")) {
    logger.warn(`Asset not found ${err.stack}`);
    response.writeHead(404);
    return response.end();
  }
  logger.error(`Error ${err.stack}`);
  response.writeHead(500);
  return response.end();
}

export async function handler(request, response) {
  return routes(request, response).catch((err) => handleError(response, err));
}
