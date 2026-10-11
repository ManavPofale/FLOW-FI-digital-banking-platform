import prisma from './src/prisma';

async function main() {
  const email = 'bharatpofale@gmail.com';
  
  // Create or get user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password_hash: 'dummy',
      role: 'CUSTOMER',
      profile: {
        create: {
          first_name: 'Bharat',
          last_name: 'Pofale',
        }
      },
      wallet: {
        create: {
          balance: 0,
        }
      }
    }
  });

  console.log(`Created/Ensured user ${email} exists with a wallet.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
