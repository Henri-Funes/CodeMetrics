import mongoose from 'mongoose';

function withDatabaseName(uri, databaseName) {
  const parsedUri = new URL(uri);
  parsedUri.pathname = `/${databaseName}`;
  return parsedUri.toString();
}

export async function connectTestDatabase() {
  const baseUri =
    process.env.TEST_MONGODB_URI ??
    process.env.MONGODB_URI ??
    'mongodb://codemetrics:codemetrics_password@mongo:27017/codemetrics?authSource=admin';
  const uri = process.env.TEST_MONGODB_URI ?? withDatabaseName(baseUri, 'codemetrics_test');

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000
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
