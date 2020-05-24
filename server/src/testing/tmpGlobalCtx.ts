import { GlobalCtx, createGlobalCtx } from '../util/ctx';
import { Config, getConfig } from '../config';
import { ForcedRollback } from '../data/db';
import { DeepPartial } from '../common';

type Callback = (ctx: GlobalCtx) => any;

type Patch = DeepPartial<{
  config: Config;
}>;

export const tmpGlobalCtx = async (callback: Callback, patch: Patch) => {
  const config = { ...getConfig(process.env), ...patch.config };
  const ctx = createGlobalCtx(config);

  try {
    await ctx.db.transaction(async () => {
      await callback(ctx);
      throw new ForcedRollback();
    });
  } catch (e) {
    await ctx.db.sequelize.close();

    const queues = Object.values(ctx.queues);
    await Promise.all(queues.map((queue) => queue.close()));

    await ctx.redis.quit();

    if (!(e instanceof ForcedRollback)) {
      throw e;
    }
  }
};
