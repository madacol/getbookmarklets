import { database as config } from "./config";
import dbBuilder from "./dbBuilder";

export const { query, sql } = dbBuilder(config);
