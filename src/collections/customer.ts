import { ObjectId } from 'mongodb';
import { AddressBaseInfo } from './address';

export interface Customer {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  address: AddressBaseInfo;
  createdAt: Date;
}
