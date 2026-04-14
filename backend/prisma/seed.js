const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const teacherPasswordHash = await bcrypt.hash('teacher123', 10);
    const studentPasswordHash = await bcrypt.hash('student123', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@quiz.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@quiz.com',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    });

    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@quiz.com' },
      update: {},
      create: {
        name: 'Ms. Sharma',
        email: 'teacher@quiz.com',
        passwordHash: teacherPasswordHash,
        role: 'TEACHER',
      },
    });

    const student = await prisma.user.upsert({
      where: { email: 'student@quiz.com' },
      update: {},
      create: {
        name: 'Dev Kumar',
        email: 'student@quiz.com',
        passwordHash: studentPasswordHash,
        role: 'STUDENT',
      },
    });

    // Create Quiz
    const quiz = await prisma.quiz.create({
      data: {
        title: 'Basic Computer Science',
        description: 'A simple quiz about computer science basics.',
        isPublished: true,
        createdById: teacher.id,
        questions: {
          create: [
            {
              text: 'What does RAM stand for?',
              optionA: 'Random Access Memory',
              optionB: 'Read Access Memory',
              optionC: 'Run Active Memory',
              optionD: 'Read Active Memory',
              correctOption: 'A',
              explanation: 'RAM stands for Random Access Memory, a type of computer memory that can be read and changed in any order.',
              order: 1,
            },
            {
              text: 'What is the primary function of a CPU?',
              optionA: 'To display graphics',
              optionB: 'To execute instructions',
              optionC: 'To store data long-term',
              optionD: 'To connect to the internet',
              correctOption: 'B',
              explanation: 'The CPU (Central Processing Unit) is the primary component of a computer that acts as its brain, executing instructions.',
              order: 2,
            },
            {
              text: 'Which of these is an operating system?',
              optionA: 'Intel',
              optionB: 'Microsoft Word',
              optionC: 'Linux',
              optionD: 'Google Chrome',
              correctOption: 'C',
              explanation: 'Linux is a widely used open-source operating system.',
              order: 3,
            },
            {
              text: 'What does HTML stand for?',
              optionA: 'Hyper Text Markup Language',
              optionB: 'High Tech Modern Language',
              optionC: 'Hyperlink and Text Markup Language',
              optionD: 'Home Tool Markup Language',
              correctOption: 'A',
              explanation: 'HTML stands for Hyper Text Markup Language, the standard markup language for creating web pages.',
              order: 4,
            },
            {
              text: 'Which data structure uses LIFO (Last In, First Out)?',
              optionA: 'Queue',
              optionB: 'Stack',
              optionC: 'Tree',
              optionD: 'Graph',
              correctOption: 'B',
              explanation: 'A stack is a linear data structure that follows a particular order in which the operations are performed: Last In, First Out (LIFO).',
              order: 5,
            }
          ]
        }
      }
    });

    console.log('Seed data inserted successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();