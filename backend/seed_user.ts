import prisma from './src/prisma';

async function main() {
  const users = await prisma.user.findMany({
    include: {
      wallet: true,
      profile: true
    }
  });

  if (users.length === 0) {
    console.log("No users found to seed.");
    return;
  }

  for (const user of users) {
    // 1. Update wallet balance
    let wallet = user.wallet;
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          user_id: user.id,
          balance: 24500.50
        }
      });
    } else {
      wallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: 24500.50 }
      });
    }

    // 2. Delete old transactions to avoid duplicate clutter if run multiple times
    await prisma.transaction.deleteMany({
      where: { wallet_id: wallet.id }
    });

    // 3. Add some transactions
    await prisma.transaction.createMany({
      data: [
        {
          wallet_id: wallet.id,
          amount: 25000,
          type: 'CREDIT',
          description: 'Salary Deposit'
        },
        {
          wallet_id: wallet.id,
          amount: 120.50,
          type: 'DEBIT',
          description: 'Coffee Shop'
        },
        {
          wallet_id: wallet.id,
          amount: 379,
          type: 'DEBIT',
          description: 'Utility Bill'
        }
      ]
    });

    // 4. Update trust score
    if (user.profile) {
      await prisma.profile.update({
        where: { id: user.profile.id },
        data: { trust_score: 840 }
      });
    } else {
      await prisma.profile.create({
        data: {
          user_id: user.id,
          trust_score: 840
        }
      });
    }

    console.log(`Updated user ${user.email} with balance, transactions, and trust score.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
