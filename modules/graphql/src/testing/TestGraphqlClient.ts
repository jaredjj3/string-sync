import { randStr } from '@stringsync/common';
import { Express, Response } from 'express';
import { extractFiles } from 'extract-files';
import request, { SuperAgentTest } from 'supertest';
import { CallResponse } from './types';

const toBuffer = async (blob: Blob): Promise<Buffer> => {
  const reader = new FileReader();
  await new Promise((resolve) => {
    reader.readAsArrayBuffer(blob);
    reader.onloadend = resolve;
  });
  return Buffer.from(reader.result!);
};

export class TestGraphqlClient {
  app: Express;
  agent: SuperAgentTest;

  constructor(app: Express) {
    this.app = app;
    this.agent = request.agent(app);
  }

  call = async <T, N extends string, V extends Record<string, any> | void = void>(
    query: string,
    variables?: V
  ): Promise<Response & { body: CallResponse<T, N> }> => {
    // extract files
    const { clone, files } = extractFiles({ query, variables });

    // compute map
    const map: { [key: string]: string | string[] } = {};
    const pathGroups = Array.from(files.values());
    for (let ndx = 0; ndx < pathGroups.length; ndx++) {
      const paths = pathGroups[ndx];
      map[ndx] = paths;
    }

    // compute buffers
    const promises = new Array<Promise<Buffer>>();
    for (const [blob, _] of files.entries()) {
      promises.push(toBuffer(blob as Blob));
    }
    const buffers = await Promise.all(promises);

    // make request
    return new Promise((resolve, reject) => {
      const req = this.agent
        .post('/graphql')
        .field('operations', JSON.stringify(clone))
        .field('map', JSON.stringify(map));

      for (let ndx = 0; ndx < buffers.length; ndx++) {
        const buffer = buffers[ndx];
        req.attach(ndx.toString(), buffer, { filename: randStr(10) });
      }

      return req.end((err, res: any) => (err ? reject(err) : resolve(res)));
    });
  };
}
