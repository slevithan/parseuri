import { parseUri, setTlds } from "../../src/index.js";

parseUri.setTlds = setTlds;
globalThis.parseUri = parseUri;
