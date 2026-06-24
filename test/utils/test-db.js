import mongoose from 'mongoose';

function withDatabaseName(uri, databaseName) {
  const parsedUri = new URL(uri);
  parsedUri.pathname = `/${databaseName}`;
  return parsedUri.toString();
}

function resolveTestDatabaseUri() {
  if (process.env.TEST_MONGODB_URI?.trim()) {
    return process.env.TEST_MONGODB_URI.trim();
  }

  const baseUri = process.env.MONGODB_URI?.trim();

  if (!baseUri) {
    throw new Error(
      'Missing TEST_MONGODB_URI or MONGODB_URI. Tests need a MongoDB Atlas connection configured in .env.'
    );
  }

  return withDatabaseName(baseUri, 'codemetrics_test');
}

export async function connectTestDatabase() {
  const uri = resolveTestDatabaseUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000
  });

  await resetTestDatabase();
}

export async function resetTestDatabase() {
  if (!mongoose.connection.db) return;

  await mongoose.connection.dropDatabase();
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

export async function disconnectTestDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
}
