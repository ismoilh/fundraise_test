import { Collection, ObjectId, Filter } from 'mongodb';
import { Customer, AnonymizedCustomer } from './collections';
import { generateHash } from './helpers';
import { connectToDatabase } from './db/connect';
import logger from './logger';

const BATCH_SIZE = 1000;

async function anonymizeCustomer(
  customer: Customer
): Promise<AnonymizedCustomer> {
  const anonymizedCustomer: AnonymizedCustomer = {
    _id: customer._id,
    firstName: generateHash(customer.firstName),
    lastName: generateHash(customer.lastName),
    email: generateHash(customer.email.split('@')[0]) + '@anonymous.com',
    address: {
      line1: generateHash(customer.address.line1),
      line2: generateHash(customer.address.line2),
      postcode: generateHash(customer.address.postcode),
      city: customer.address.city,
      state: customer.address.state,
      country: customer.address.country,
    },
    createdAt: new Date(),
  };

  return anonymizedCustomer;
}

async function pollForChanges(
  customersCollection: Collection<Customer>,
  anonymizedCustomersCollection: Collection<AnonymizedCustomer>,
  lastProcessedId: ObjectId | null
): Promise<ObjectId | null> {
  let query: Filter<Customer> = {};

  if (lastProcessedId) {
    query._id = { $gt: lastProcessedId };
  }

  const customers = await customersCollection
    .find(query)
    .sort({ _id: 1 })
    .limit(BATCH_SIZE)
    .toArray();

  let count = 0;

  for (const customer of customers) {
    const customerExists = await anonymizedCustomersCollection.findOne({
      _id: new ObjectId(customer._id),
    });

    if (!customerExists) {
      const anonymizedCustomer = await anonymizeCustomer(customer);
      await anonymizedCustomersCollection.insertOne(anonymizedCustomer);
      logger.info('Customer anonymized:', anonymizedCustomer._id);
      count++;
    }
  }

  logger.info('Processed:', count);

  return lastProcessedId;
}

async function performFullReindex(
  customersCollection: Collection<Customer>,
  anonymizedCustomersCollection: Collection<AnonymizedCustomer>
): Promise<void> {
  let lastProcessedId: ObjectId | null = null;
  let count: number = 0;

  while (true) {
    lastProcessedId = await pollForChanges(
      customersCollection,
      anonymizedCustomersCollection,
      lastProcessedId
    );

    if (!lastProcessedId) {
      break;
    }

    count++;
  }

  logger.info('Full reindex complete. Processed:', count);
}

async function main(): Promise<void> {
  try {
    const { db } = await connectToDatabase();

    const customersCollection = db.collection<Customer>('customers');
    const anonymizedCustomersCollection = db.collection<AnonymizedCustomer>(
      'customers_anonymised'
    );
    const fullReindex = process.argv.includes('--full-reindex');

    if (fullReindex) {
      logger.info('Performing full reindex');
      await performFullReindex(
        customersCollection,
        anonymizedCustomersCollection
      );
      process.exit(0);
    } else {
      let lastProcessedId: ObjectId | null = null;

      logger.info('Sync started');

      while (true) {
        lastProcessedId = await pollForChanges(
          customersCollection,
          anonymizedCustomersCollection,
          lastProcessedId
        );

        // Add some delay between polls to avoid frequent database queries
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

main();
