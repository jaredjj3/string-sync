import { TYPES } from '@stringsync/di';
import { Logger } from '@stringsync/util';
import { Handler } from 'express';
import { interfaces } from 'inversify';
import morgan from 'morgan';

export const withLogging = (container: interfaces.Container): Handler => {
  const logger = container.get<Logger>(TYPES.Logger);
  return morgan('combined', {
    stream: {
      write: (msg: string) => {
        logger.info(msg.trim());
      },
    },
  });
};