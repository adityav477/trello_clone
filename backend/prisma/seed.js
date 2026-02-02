import prisma from '../config/prisma-signleton.js'; // Kept your filename spelling
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Clean up existing data
  // Order matters here to avoid foreign key constraint errors
  await prisma.attachments.deleteMany();
  await prisma.card.deleteMany();
  await prisma.list.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Password Hash
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 3. Create User 1 (Alice)
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice Manager',
      password: hashedPassword,
      account: 'FREE',
    },
  });

  // 4. Create User 2 (Bob)
  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob Worker',
      password: hashedPassword,
      account: 'FREE',
    },
  });

  console.log(`👤 Created Users: ${alice.name} and ${bob.name}`);

  // Helper dates
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

  // 5. Create the "Shared Board" with Lists AND Cards (with ORDER)
  const sharedBoard = await prisma.board.create({
    data: {
      title: 'Project Alpha (Shared)',
      owner_id: alice.id,
      members: {
        create: {
          userId: bob.id,
          permission: 'READ_WRITE',
        },
      },
      lists: {
        create: [
          {
            title: 'To Do',
            cards: {
              create: [
                {
                  title: 'Design Database Schema',
                  description: 'Define tables for User, Board, List, Card',
                  dueDate: tomorrow,
                  order: 0 // First item
                },
                {
                  title: 'Setup GitHub Repo',
                  description: 'Initialize repository and add collaborators',
                  dueDate: today,
                  order: 1 // Second item
                }
              ]
            }
          },
          {
            title: 'In Progress',
            cards: {
              create: [
                {
                  title: 'Build Authentication API',
                  description: 'Implement JWT login and registration',
                  dueDate: nextWeek,
                  order: 0
                },
                {
                  title: 'Create React Components',
                  description: 'Build Navbar and Sidebar',
                  order: 1
                }
              ]
            }
          },
          {
            title: 'Done',
            cards: {
              create: [
                {
                  title: 'Project Kickoff Meeting',
                  description: 'Discussed requirements with the client',
                  dueDate: yesterday,
                  order: 0
                }
              ]
            }
          }
        ]
      }
    },
  });

  console.log(`🤝 Created Shared Board: "${sharedBoard.title}" with ordered cards`);

  // 6. Create 8 "Private Boards" for Alice with Cards (with ORDER)
  const privateBoardsData = Array.from({ length: 8 }).map((_, i) => ({
    title: `Alice's Private Board ${i + 1}`,
    owner_id: alice.id,
    lists: {
      create: [
        {
          title: 'Backlog',
          cards: {
            create: [
              {
                title: 'Research Competitors',
                description: 'Look at Trello and Asana features',
                dueDate: nextWeek,
                order: 0
              },
              {
                title: 'Draft Budget',
                description: 'Estimate costs for AWS hosting',
                dueDate: tomorrow,
                order: 1
              }
            ]
          }
        },
        {
          title: 'Ideas',
          cards: {
            create: [
              {
                title: 'Dark Mode Support',
                description: 'Maybe add a toggle in settings?',
                dueDate: null,
                order: 0
              }
            ]
          }
        }
      ]
    }
  }));

  for (const boardData of privateBoardsData) {
    await prisma.board.create({ data: boardData });
  }

  console.log(`📚 Created 8 private boards for Alice with ordered cards (Total: 9)`);
  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
