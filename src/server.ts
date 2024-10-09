#!/usr/bin/env node
import "dotenv/config";
import path from "path";
import expo from "@expo/server/adapter/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import { createClient } from "./server-utils/client";

const CLIENT_BUILD_DIR = path.join(process.cwd(), "dist/client");
const SERVER_BUILD_DIR = path.join(process.cwd(), "dist/server");

async function main() {
  const oauthClient = await createClient();

  const app = express();

  app.use(compression());

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");

  process.env.NODE_ENV = "production";

  app.use(express.json());

  app.use(
    express.static(CLIENT_BUILD_DIR, {
      maxAge: "1h",
      extensions: ["html"],
    }),
  );

  app.use(morgan("tiny"));

  const handler =
    (fn: express.Handler) =>
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      try {
        await fn(req, res, next);
      } catch (err) {
        next(err);
      }
    };

  app.get(
    "/client-metadata.json",
    handler((_req, res) => {
      return res.json(oauthClient.clientMetadata);
    }),
  );

  app.all(
    "*",
    expo.createRequestHandler({
      build: SERVER_BUILD_DIR,
    }),
  );
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });
}

main();
