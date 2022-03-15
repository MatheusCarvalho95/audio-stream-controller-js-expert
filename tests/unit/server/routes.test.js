import { jest, expect, describe, test, beforeEach } from "@jest/globals";
import config from "../../../server/config.js";
import { Controller } from "../../../server/controller.js";
import { handler } from "../../../server/routes.js";
import TestUtils from "../_utils/testUtils.js";
const {
  pages,
  location,
  constants: { CONTENT_TYPE },
} = config;
describe("#-Routes - api response", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  test("GET / - Should redirect to home page", async () => {
    const params = TestUtils.defaultHandleParams();
    params.request.method = "GET";
    params.request.url = "/";

    await handler(...params.values());

    expect(params.response.writeHead).toBeCalledWith(302, {
      Location: location.home,
    });

    expect(params.response.end).toHaveBeenCalled();
  });
  test(`GET /home - Should return the ${pages.homeHTML} file stream`, async () => {
    const params = TestUtils.defaultHandleParams();

    params.request.method = "GET";
    params.request.url = "/home";

    const mockFileStream = TestUtils.generateReadableStream(["data"]);

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML);
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test(`GET /controller - Should return the ${pages.controllerHTML} file stream`, async () => {
    const params = TestUtils.defaultHandleParams();

    params.request.method = "GET";
    params.request.url = "/controller";

    const mockFileStream = TestUtils.generateReadableStream(["data"]);

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(
      pages.controllerHTML,
    );
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
  });

  test("GET/ index.html - Should return the requested file stream", async () => {
    const params = TestUtils.defaultHandleParams();
    const requestedFileName = "/index.html";
    params.request.method = "GET";
    params.request.url = requestedFileName;
    const expectedType = ".html";
    const mockFileStream = TestUtils.generateReadableStream(["data"]);

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(
      requestedFileName,
    );
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).toBeCalledWith(200, {
      "Content-Type": CONTENT_TYPE[expectedType],
    });
  });

  test("GET/ file.ext - Should return the requested file stream", async () => {
    const params = TestUtils.defaultHandleParams();
    const requestedFileName = "/file.ext";
    params.request.method = "GET";
    params.request.url = requestedFileName;
    const expectedType = ".ext";
    const mockFileStream = TestUtils.generateReadableStream(["data"]);

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      });

    jest.spyOn(mockFileStream, "pipe").mockReturnValue();

    await handler(...params.values());

    expect(Controller.prototype.getFileStream).toBeCalledWith(
      requestedFileName,
    );
    expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response);
    expect(params.response.writeHead).not.toHaveBeenCalled();
  });

  test("GET /UNKNOWN - If inexistant route, should return 404", async () => {
    const params = TestUtils.defaultHandleParams();

    params.request.method = "GET";
    params.request.url = "/unknown";

    await handler(...params.values());

    expect(params.response.writeHead).toHaveBeenCalledWith(404);
    expect(params.response.end).toHaveBeenCalled();
  });

  describe("#-Exeptions handling", () => {
    test("Requested inexistant file - Should return 404", async () => {
      const params = TestUtils.defaultHandleParams();

      params.request.method = "GET";
      params.request.url = "/index.png";
      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(new Error("ERROR : ENOENT"));

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(404);
      expect(params.response.end).toHaveBeenCalled();
    });
    test("Error on api call - Should return 500", async () => {
      const params = TestUtils.defaultHandleParams();

      params.request.method = "GET";
      params.request.url = "/index.png";
      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(
          new Error("ERROR : " + Math.floor(Math.random() * 10)),
        );

      await handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(500);
      expect(params.response.end).toHaveBeenCalled();
    });
  });
});
