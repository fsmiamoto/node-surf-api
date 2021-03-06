import "./util/module-alias";
import { Server } from "@overnightjs/core";
import { Application } from "express";
import bodyParser from "body-parser";
import * as database from "@src/database";

import { ForecastController } from "./controllers/forecast";
import { BeachesController } from "./controllers/beaches";
import { UsersController } from "./controllers/users";

export class SetupServer extends Server {
  constructor(private port = 3333) {
    super();
  }

  public async init(): Promise<void> {
    this.setupExpress();
    this.setupControllers();
    await this.databaseSetup();
  }
  public start(): void {
    this.app.listen(this.port, () => {
      console.info("Server listening on port: ", this.port);
    });
  }

  public getApp(): Application {
    return this.app;
  }

  public async close(): Promise<void> {
    await database.close();
  }

  private setupExpress() {
    this.app.use(bodyParser.json());
  }

  private setupControllers() {
    this.addControllers([
      new ForecastController(),
      new BeachesController(),
      new UsersController(),
    ]);
  }

  private async databaseSetup(): Promise<void> {
    await database.connect();
  }
}
