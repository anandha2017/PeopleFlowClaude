import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.person.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();
  await prisma.location.deleteMany();

  console.log('✅ Cleaned existing data');

  // ============================================
  // 1. Create Locations
  // ============================================
  const london = await prisma.location.create({
    data: {
      name: 'London Office',
      code: 'LON',
      city: 'London',
      country: 'United Kingdom',
      timezone: 'Europe/London',
    },
  });

  const wolverhampton = await prisma.location.create({
    data: {
      name: 'Wolverhampton Office',
      code: 'WOL',
      city: 'Wolverhampton',
      country: 'United Kingdom',
      timezone: 'Europe/London',
    },
  });

  const chatham = await prisma.location.create({
    data: {
      name: 'Chatham Office',
      code: 'CHT',
      city: 'Chatham',
      country: 'United Kingdom',
      timezone: 'Europe/London',
    },
  });

  const bengaluru = await prisma.location.create({
    data: {
      name: 'Bengaluru Office',
      code: 'BLR',
      city: 'Bengaluru',
      country: 'India',
      timezone: 'Asia/Kolkata',
    },
  });

  console.log('✅ Created locations');

  // ============================================
  // 2. Create Departments
  // ============================================
  const engineering = await prisma.department.create({
    data: {
      name: 'Engineering',
      code: 'ENG',
      description: 'Software development and infrastructure',
    },
  });

  const product = await prisma.department.create({
    data: {
      name: 'Product',
      code: 'PRD',
      description: 'Product management and design',
    },
  });

  const hr = await prisma.department.create({
    data: {
      name: 'Human Resources',
      code: 'HR',
      description: 'People operations and talent management',
    },
  });

  const finance = await prisma.department.create({
    data: {
      name: 'Finance',
      code: 'FIN',
      description: 'Financial planning and operations',
    },
  });

  const marketing = await prisma.department.create({
    data: {
      name: 'Marketing',
      code: 'MKT',
      description: 'Marketing and communications',
    },
  });

  console.log('✅ Created departments');

  // ============================================
  // 3. Create People (Leadership)
  // ============================================

  // CEO
  const ceo = await prisma.person.create({
    data: {
      firstName: 'Sarah',
      lastName: 'Thompson',
      email: 'sarah.thompson@company.com',
      jobTitle: 'Chief Executive Officer',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      startDate: new Date('2020-01-01'),
      fullTimeEquivalent: 1.0,
      locationId: london.id,
      departmentId: engineering.id, // For simplicity
      skills: ['Leadership', 'Strategy', 'Business Development'],
      bio: 'Experienced leader with 20+ years in tech industry',
    },
  });

  // VP Engineering
  const vpEng = await prisma.person.create({
    data: {
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@company.com',
      jobTitle: 'VP of Engineering',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      startDate: new Date('2020-03-01'),
      fullTimeEquivalent: 1.0,
      locationId: london.id,
      departmentId: engineering.id,
      managerId: ceo.id,
      skills: ['Engineering Leadership', 'Architecture', 'Team Building'],
    },
  });

  // Engineering Manager
  const engManager = await prisma.person.create({
    data: {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@company.com',
      jobTitle: 'Engineering Manager',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      startDate: new Date('2021-01-15'),
      fullTimeEquivalent: 1.0,
      locationId: london.id,
      departmentId: engineering.id,
      managerId: vpEng.id,
      skills: ['Team Management', 'Agile', 'Technical Leadership'],
    },
  });

  // VP Product
  const vpProduct = await prisma.person.create({
    data: {
      firstName: 'Emma',
      lastName: 'Williams',
      email: 'emma.williams@company.com',
      jobTitle: 'VP of Product',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      startDate: new Date('2020-06-01'),
      fullTimeEquivalent: 1.0,
      locationId: london.id,
      departmentId: product.id,
      managerId: ceo.id,
      skills: ['Product Strategy', 'User Experience', 'Data Analytics'],
    },
  });

  // HR Director
  const hrDirector = await prisma.person.create({
    data: {
      firstName: 'Michael',
      lastName: 'Brown',
      email: 'michael.brown@company.com',
      jobTitle: 'HR Director',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      startDate: new Date('2020-09-01'),
      fullTimeEquivalent: 1.0,
      locationId: london.id,
      departmentId: hr.id,
      managerId: ceo.id,
      skills: ['Talent Management', 'HR Operations', 'People Development'],
    },
  });

  console.log('✅ Created leadership team');

  // ============================================
  // 4. Create Engineers
  // ============================================

  const engineers = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@company.com',
      jobTitle: 'Senior Software Engineer',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
      locationId: london.id,
    },
    {
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@company.com',
      jobTitle: 'Software Engineer',
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      locationId: wolverhampton.id,
    },
    {
      firstName: 'Bob',
      lastName: 'Martinez',
      email: 'bob.martinez@company.com',
      jobTitle: 'Senior Software Engineer',
      skills: ['Java', 'Spring Boot', 'Kubernetes', 'Docker'],
      locationId: bengaluru.id,
    },
    {
      firstName: 'Carol',
      lastName: 'Davis',
      email: 'carol.davis@company.com',
      jobTitle: 'DevOps Engineer',
      skills: ['AWS', 'Terraform', 'CI/CD', 'Monitoring'],
      locationId: london.id,
    },
    {
      firstName: 'David',
      lastName: 'Lee',
      email: 'david.lee@company.com',
      jobTitle: 'Frontend Engineer',
      skills: ['React', 'TypeScript', 'CSS', 'UI/UX'],
      locationId: chatham.id,
    },
  ];

  for (const engineer of engineers) {
    await prisma.person.create({
      data: {
        ...engineer,
        employmentStatus: 'ACTIVE',
        employmentType: 'FULL_TIME',
        startDate: new Date('2022-03-01'),
        fullTimeEquivalent: 1.0,
        departmentId: engineering.id,
        managerId: engManager.id,
      },
    });
  }

  console.log('✅ Created engineers');

  // ============================================
  // 5. Create Product Team
  // ============================================

  const productTeam = [
    {
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa.anderson@company.com',
      jobTitle: 'Product Manager',
      skills: ['Product Management', 'Agile', 'User Research'],
      managerId: vpProduct.id,
    },
    {
      firstName: 'Tom',
      lastName: 'Garcia',
      email: 'tom.garcia@company.com',
      jobTitle: 'UX Designer',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      managerId: vpProduct.id,
    },
  ];

  for (const member of productTeam) {
    await prisma.person.create({
      data: {
        ...member,
        employmentStatus: 'ACTIVE',
        employmentType: 'FULL_TIME',
        startDate: new Date('2021-06-01'),
        fullTimeEquivalent: 1.0,
        locationId: london.id,
        departmentId: product.id,
      },
    });
  }

  console.log('✅ Created product team');

  // ============================================
  // 6. Create HR Team
  // ============================================

  const hrManager = await prisma.person.create({
    data: {
      firstName: 'Rachel',
      lastName: 'Taylor',
      email: 'rachel.taylor@company.com',
      jobTitle: 'HR Manager',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      startDate: new Date('2021-03-01'),
      fullTimeEquivalent: 1.0,
      locationId: london.id,
      departmentId: hr.id,
      managerId: hrDirector.id,
      skills: ['Recruitment', 'Employee Relations', 'HR Operations'],
    },
  });

  const recruiter = await prisma.person.create({
    data: {
      firstName: 'Kevin',
      lastName: 'White',
      email: 'kevin.white@company.com',
      jobTitle: 'Recruiter',
      employmentStatus: 'ACTIVE',
      employmentType: 'FULL_TIME',
      startDate: new Date('2022-01-01'),
      fullTimeEquivalent: 1.0,
      locationId: london.id,
      departmentId: hr.id,
      managerId: hrManager.id,
      skills: ['Technical Recruitment', 'Sourcing', 'Interviewing'],
    },
  });

  console.log('✅ Created HR team');

  // ============================================
  // 7. Update Department Heads
  // ============================================

  await prisma.department.update({
    where: { id: engineering.id },
    data: { headId: vpEng.id },
  });

  await prisma.department.update({
    where: { id: product.id },
    data: { headId: vpProduct.id },
  });

  await prisma.department.update({
    where: { id: hr.id },
    data: { headId: hrDirector.id },
  });

  console.log('✅ Updated department heads');

  // ============================================
  // 8. Create Users (for authentication)
  // ============================================

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  await prisma.user.create({
    data: {
      email: 'admin@company.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.user.create({
    data: {
      email: 'hr@company.com',
      password: hashedPassword,
      name: 'HR Admin',
      role: 'HR_ADMIN',
      personId: hrManager.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'manager@company.com',
      password: hashedPassword,
      name: 'Jane Smith',
      role: 'MANAGER',
      personId: engManager.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'employee@company.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'EMPLOYEE',
    },
  });

  console.log('✅ Created users (all passwords: Password123!)');

  console.log('\n🎉 Seed completed successfully!\n');
  console.log('📊 Summary:');
  console.log(`  - ${await prisma.location.count()} locations`);
  console.log(`  - ${await prisma.department.count()} departments`);
  console.log(`  - ${await prisma.person.count()} people`);
  console.log(`  - ${await prisma.user.count()} users`);
  console.log('\n🔐 Test Credentials:');
  console.log('  Email: admin@company.com | Password: Password123! | Role: Super Admin');
  console.log('  Email: hr@company.com | Password: Password123! | Role: HR Admin');
  console.log('  Email: manager@company.com | Password: Password123! | Role: Manager');
  console.log('  Email: employee@company.com | Password: Password123! | Role: Employee\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
