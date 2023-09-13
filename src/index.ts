import express, { Request, Response } from 'express';
// @ts-ignore
import generator from "@asyncapi/generator";

const app = express();
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

app.get('/', async (_req: Request, res: Response) => {
    return res.send('Express Typescript on Vercel');
});

app.get('/ping', async (_req: Request, res: Response) => {
    const generatorInstance = new generator(
        "@asyncapi/html-template", 
        "/tmp", 
        {
            forceWrite: true
        }
    );
    await generatorInstance.generateFromString(spec);
    return res.send('pong 🏓');
});

app.listen(port, () => {
    return console.log(`Server is listening on ${port}`);
});