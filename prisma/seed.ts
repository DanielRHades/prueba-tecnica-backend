import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

//No utilizo el singleton de PrismaClient debido a que se ejecuta fuera de NextJs
const prisma = new PrismaClient();

async function main() {
  const now = new Date();

  const adminRole = await prisma.role.create({
    data: {
      id: '1',
      name: 'Admin'
    }
  });

  const managerRole = await prisma.role.create({
    data: {
      id: '2',
      name: 'Manager'
    }
  });

  const userRole = await prisma.role.create({
    data: {
      id: '3',
      name: 'User'
    }
  });

  const colombia = await prisma.country.create({
    data: {
      id: '1',
      name: 'Colombia',
      updatedAt: now
    }
  });

  const mexico = await prisma.country.create({
    data: {
      id: '2',
      name: 'México',
      updatedAt: now
    }
  });

  const adminPassword = await hash('admin123', 10);
  const managerPassword = await hash('manager123', 10);
  const userPassword = await hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      id: '1',
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      roleId: adminRole.id,
      updatedAt: now,
      Country: {
        connect: [{ id: colombia.id }]
      }
    }
  });

  const manager = await prisma.user.create({
    data: {
      id: '2',
      email: 'manager@example.com',
      password: managerPassword,
      name: 'Manager User',
      roleId: managerRole.id,
      updatedAt: now,
      Country: {
        connect: [{ id: mexico.id }]
      }
    }
  });

  const user = await prisma.user.create({
    data: {
      id: '3',
      email: 'user@example.com',
      password: userPassword,
      name: 'Regular User',
      roleId: userRole.id,
      updatedAt: now,
      Country: {
        connect: [{ id: colombia.id }]
      }
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
