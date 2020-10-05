/*
import mongoose from 'mongoose';
import Faker from 'faker';
import { getUserEmailById, InputUser } from '../user.controller';

describe('Get user email by _id', () => {
  it('should return the right email', () => {
    
    // Compile an array of users that only have the required fields
    
    const users: InputUser[] = Array(10)
      .fill(undefined)
      .map(() => {
        return {
          email: Faker.internet.email(),
          _id: mongoose.Types.ObjectId()
        };
      });

    expect.assertions(users.length);

    for (let i = 0; i < users.length; i += 1) {
      expect(getUserEmailById(users[i], users)).toBe(users[i].email);
    }
  });
});
*/