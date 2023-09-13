"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// @ts-ignore
const generator_1 = __importDefault(require("@asyncapi/generator"));
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
const spec = `
asyncapi: "2.5.0"
info:
  title: Demo API
  version: "1.0.0"
channels:
  channelOne:
    publish:
      summary: This is the first sample channel
      operationId: onMessage
      message:
        name: FirstMessage
        payload:
          id:
            type: integer
            minimum: 0
            description: Id of the channel
          sentAt:
            type: string
            format: date-time
            description: Date and time when the message was sent.
  channelTwo:
    publish:
      summary: This is the second sample channel
      operationId: messageRead
      message:
        name: SecondMessage
        payload:
          id:
            type: integer
            minimum: 0
            description: Id of the channel
          sentAt:
            type: string
            format: date-time
            description: Date and time when the message was sent.
`;
app.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send('Express Typescript on Vercel');
}));
app.get('/ping', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const generatorInstance = new generator_1.default("@asyncapi/html-template", "/tmp", {
        forceWrite: true
    });
    yield generatorInstance.generateFromString(spec);
    return res.send('pong 🏓');
}));
app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});
//# sourceMappingURL=index.js.map