import { countryResolvers } from '@/graphql/countries/countries.resolvers';
import { Context } from '@/graphql/context';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const actualPrisma = jest.requireActual('@prisma/client');
  return {
    ...actualPrisma,
    PrismaClient: jest.fn().mockImplementation(() => ({
      $queryRaw: jest.fn().mockResolvedValue([
        { id: '1', name: 'Country 1' },
        { id: '2', name: 'Country 2' }
      ]),
      $connect: jest.fn(),
      $disconnect: jest.fn(),
      $use: jest.fn(),
      $on: jest.fn()
    }))
  };
});

jest.mock('../graphql/utils/errors', () => ({
  requireRole: jest.fn()
}));

enum Enum_RoleName {
  Admin = 'Admin',
  Manager = 'Manager',
  User = 'User'
}

describe('countryResolvers', () => {
  let context: Context;

  beforeEach(() => {
    context = {
      prisma: new PrismaClient(),
      user: {
        id: '1',
        name: 'Daniel',
        email: 'daniel@test.com',
        password: 'daniel123',
        roleId: 'roleId',
        createdAt: new Date(),
        updatedAt: new Date(),
        emailVerified: null,
        termsAndConditionsAccepted: null,
        image: null,
        position: null,
        Role: {
          id: 'roleId',
          name: Enum_RoleName.Admin,
          createdAt: new Date()
        },
        Country: []
      }
    };
  });

  it('Debe regresar todos los countries.', async () => {
    const result = await countryResolvers.Query.countries(
      null,
      { take: 2, skip: 0 },
      context
    );

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Country 1');
    expect(result[1].name).toBe('Country 2');
  });
});
