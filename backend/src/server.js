import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function bootstrap() {
  await connectDatabase();

  const app = createApp();

  app.listen(env.port, '0.0.0.0', () => {
    console.log(`CodeMetrics API listening on port ${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Unable to start CodeMetrics API');
  console.error(error);
  process.exit(1);
});
