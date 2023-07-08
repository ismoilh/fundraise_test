import { Collection, ObjectId } from 'mongodb';
import { faker } from '@faker-js/faker';
import { Customer } from './collections';
import logger from './logger';
import { connectToDatabase } from './db/connect';

async function insertCustomers(
  collection: Collection<Customer>,
  customers: Customer[]
): Promise<void> {
  try {
    await collection.insertMany(customers);
    logger.info(`Inserted ${customers.length} customers`);
  } catch (error) {
    logger.error('Error inserting customers:', error);
    throw error;
  }
}

async function main() {
  try {
    const { db } = await connectToDatabase();

    const collection = db.collection<Customer>('customers');

    while (true) {
      const customers: Customer[] = [];

      const batchSize = Math.floor(Math.random() * 10) + 1;
      for (let i = 0; i < batchSize; i++) {
        const customer: Customer = {
          _id: new ObjectId(),
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          address: {
            line1: faker.location.streetAddress(),
            line2: faker.location.secondaryAddress(),
            postcode: faker.location.zipCode(),
            city: faker.location.city(),
            state: faker.location.state({ abbreviated: true }),
            country: faker.location.countryCode(),
          },
          createdAt: new Date(),
        };

        customers.push(customer);
      }

      await insertCustomers(collection, customers);

      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  } catch (error) {
    logger.error('Error:', error);
    throw error;
  }
}

main();
