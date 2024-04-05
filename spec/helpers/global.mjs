import { parseUri, setSld } from "../../src/index.js";

parseUri.setSld = setSld;
globalThis.parseUri = parseUri;
