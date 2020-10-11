import config, { IConfig } from "config";
import mongoose, { Mongoose } from "mongoose";

const dbConfig: IConfig = config.get("App.database");

export const connect = async (): Promise<Mongoose> =>
  await mongoose.connect(dbConfig.get("mongoUrl"), {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 2000,
  });

export const close = (): Promise<void> => mongoose.connection.close();
