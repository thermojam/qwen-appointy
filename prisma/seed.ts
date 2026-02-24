import {PrismaClient, UserRole, WorkFormat, DayOfWeek} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

// Master data with realistic Russian names
const mastersData = [
    {
        email: 'anna.smirnova@example.com',
        password: 'password123',
        fullName: 'Анна Смирнова',
        description: 'Опытный мастер маникюра и педикюра. Работаю более 7 лет. Использую только качественные материалы. Создаю красоту и уют для ваших рук и ног.',
        workFormat: WorkFormat.OFFLINE,
        address: 'Москва, ул. Тверская, 15',
        latitude: 55.7558,
        longitude: 37.6173,
        experienceYears: 7,
        rating: 4.8,
        totalReviews: 124,
        isVerified: true,
        services: [
            {name: 'Маникюр базовый', duration: 90, price: 2500},
            {name: 'Маникюр с покрытием', duration: 120, price: 3500},
            {name: 'Педикюр полный', duration: 150, price: 4500},
            {name: 'Наращивание ногтей', duration: 180, price: 5500},
        ],
        schedule: [
            {dayOfWeek: DayOfWeek.MONDAY, startTime: '10:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.TUESDAY, startTime: '10:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '10:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.THURSDAY, startTime: '10:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.FRIDAY, startTime: '10:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.SATURDAY, startTime: '11:00', endTime: '18:00'},
        ],
    },
    {
        email: 'elena.kozlova@example.com',
        password: 'password123',
        fullName: 'Елена Козлова',
        description: 'Стилист-парикмахер с опытом работы 10 лет. Специализируюсь на сложных окрашиваниях и стрижках. Постоянно повышаю квалификацию.',
        workFormat: WorkFormat.OFFLINE,
        address: 'Москва, проспект Мира, 45',
        latitude: 55.7961,
        longitude: 37.6415,
        experienceYears: 10,
        rating: 4.9,
        totalReviews: 256,
        isVerified: true,
        services: [
            {name: 'Стрижка женская', duration: 60, price: 3000},
            {name: 'Окрашивание волос', duration: 180, price: 8000},
            {name: 'Мелирование', duration: 240, price: 10000},
            {name: 'Укладка вечерняя', duration: 90, price: 4000},
            {name: 'Стрижка мужская', duration: 45, price: 2000},
        ],
        schedule: [
            {dayOfWeek: DayOfWeek.MONDAY, startTime: '11:00', endTime: '21:00'},
            {dayOfWeek: DayOfWeek.TUESDAY, startTime: '11:00', endTime: '21:00'},
            {dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '11:00', endTime: '21:00'},
            {dayOfWeek: DayOfWeek.THURSDAY, startTime: '11:00', endTime: '21:00'},
            {dayOfWeek: DayOfWeek.FRIDAY, startTime: '11:00', endTime: '21:00'},
            {dayOfWeek: DayOfWeek.SATURDAY, startTime: '10:00', endTime: '18:00'},
        ],
    },
    {
        email: 'maria.petrova@example.com',
        password: 'password123',
        fullName: 'Мария Петрова',
        description: 'Визажист-стилист. Работаю с невестами, выпускницами, создаю образы для фотосессий. Индивидуальный подход к каждой клиентке.',
        workFormat: WorkFormat.BOTH,
        address: 'Москва, ул. Арбат, 20',
        latitude: 55.7489,
        longitude: 37.5870,
        experienceYears: 5,
        rating: 4.7,
        totalReviews: 89,
        isVerified: true,
        services: [
            {name: 'Дневной макияж', duration: 60, price: 3500},
            {name: 'Вечерний макияж', duration: 90, price: 5000},
            {name: 'Свадебный образ', duration: 180, price: 12000},
            {name: 'Макияж для фотосессии', duration: 90, price: 6000},
        ],
        schedule: [
            {dayOfWeek: DayOfWeek.TUESDAY, startTime: '12:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '12:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.THURSDAY, startTime: '12:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.FRIDAY, startTime: '12:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.SATURDAY, startTime: '10:00', endTime: '18:00'},
            {dayOfWeek: DayOfWeek.SUNDAY, startTime: '10:00', endTime: '16:00'},
        ],
    },
    {
        email: 'olga.volkova@example.com',
        password: 'password123',
        fullName: 'Ольга Волкова',
        description: 'Мастер бровист-лашмейкер. Делаю ваши брови и ресницы идеальными. Работаю на премиум материалах.',
        workFormat: WorkFormat.OFFLINE,
        address: 'Москва, Кутузовский проспект, 32',
        latitude: 55.7414,
        longitude: 37.5336,
        experienceYears: 4,
        rating: 4.6,
        totalReviews: 67,
        isVerified: false,
        services: [
            {name: 'Коррекция бровей', duration: 30, price: 1000},
            {name: 'Окрашивание бровей', duration: 45, price: 1500},
            {name: 'Ламинирование бровей', duration: 90, price: 3500},
            {name: 'Наращивание ресниц (классика)', duration: 120, price: 4000},
            {name: 'Наращивание ресниц (2D)', duration: 150, price: 5000},
        ],
        schedule: [
            {dayOfWeek: DayOfWeek.MONDAY, startTime: '10:00', endTime: '19:00'},
            {dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '10:00', endTime: '19:00'},
            {dayOfWeek: DayOfWeek.FRIDAY, startTime: '10:00', endTime: '19:00'},
            {dayOfWeek: DayOfWeek.SATURDAY, startTime: '11:00', endTime: '17:00'},
        ],
    },
    {
        email: 'natalia.sokolova@example.com',
        password: 'password123',
        fullName: 'Наталья Соколова',
        description: 'Массажист с медицинским образованием. Специализируюсь на лечебном и расслабляющем массаже. Индивидуальный подход к каждому клиенту.',
        workFormat: WorkFormat.OFFLINE,
        address: 'Москва, ул. Ленинский проспект, 80',
        latitude: 55.7047,
        longitude: 37.5877,
        experienceYears: 8,
        rating: 4.9,
        totalReviews: 178,
        isVerified: true,
        services: [
            {name: 'Общий массаж тела', duration: 90, price: 4500},
            {name: 'Массаж спины', duration: 45, price: 2500},
            {name: 'Антицеллюлитный массаж', duration: 60, price: 3500},
            {name: 'Лимфодренажный массаж', duration: 90, price: 5000},
            {name: 'Спортивный массаж', duration: 60, price: 4000},
        ],
        schedule: [
            {dayOfWeek: DayOfWeek.MONDAY, startTime: '09:00', endTime: '21:00'},
            {dayOfWeek: DayOfWeek.TUESDAY, startTime: '09:00', endTime: '21:00'},
            {dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '09:00', endTime: '21:00'},
            {dayOfWeek: DayOfWeek.THURSDAY, startTime: '09:00', endTime: '21:00'},
            {dayOfWeek: DayOfWeek.FRIDAY, startTime: '09:00', endTime: '21:00'},
        ],
    },
    {
        email: 'irina.lebedeva@example.com',
        password: 'password123',
        fullName: 'Ирина Лебедева',
        description: 'Косметолог-эстетист. Чистки, пилинги, уходовые процедуры. Работаю на профессиональной косметике.',
        workFormat: WorkFormat.BOTH,
        address: 'Москва, ул. Новослободская, 25',
        latitude: 55.7803,
        longitude: 37.6038,
        experienceYears: 6,
        rating: 4.5,
        totalReviews: 92,
        isVerified: true,
        services: [
            {name: 'Чистка лица ультразвуковая', duration: 90, price: 4000},
            {name: 'Чистка лица комбинированная', duration: 120, price: 5500},
            {name: 'Пилинг химический', duration: 60, price: 3500},
            {name: 'Уходовая процедура', duration: 90, price: 4500},
            {name: 'Массаж лица', duration: 45, price: 2500},
        ],
        schedule: [
            {dayOfWeek: DayOfWeek.TUESDAY, startTime: '10:00', endTime: '19:00'},
            {dayOfWeek: DayOfWeek.THURSDAY, startTime: '10:00', endTime: '19:00'},
            {dayOfWeek: DayOfWeek.SATURDAY, startTime: '10:00', endTime: '18:00'},
            {dayOfWeek: DayOfWeek.SUNDAY, startTime: '11:00', endTime: '17:00'},
        ],
    },
    {
        email: 'ekaterina.morozova@example.com',
        password: 'password123',
        fullName: 'Екатерина Морозова',
        description: 'Мастер шугаринга и восковой депиляции. Быстро, качественно, минимально болезненно. Работаю с любыми зонами.',
        workFormat: WorkFormat.ONLINE,
        address: 'Онлайн консультации',
        latitude: null,
        longitude: null,
        experienceYears: 3,
        rating: 4.4,
        totalReviews: 45,
        isVerified: false,
        services: [
            {name: 'Шугаринг подмышки', duration: 30, price: 800},
            {name: 'Шугаринг бикини', duration: 60, price: 2000},
            {name: 'Шугаринг ноги полностью', duration: 90, price: 3000},
            {name: 'Восковая депиляция', duration: 60, price: 2500},
            {name: 'Консультация онлайн', duration: 30, price: 500},
        ],
        schedule: [
            {dayOfWeek: DayOfWeek.MONDAY, startTime: '14:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '14:00', endTime: '20:00'},
            {dayOfWeek: DayOfWeek.FRIDAY, startTime: '14:00', endTime: '20:00'},
        ],
    },
];

// Client data
const clientsData = [
    {
        email: 'client1@example.com',
        password: 'password123',
        fullName: 'Татьяна Иванова',
        interests: ['Маникюр', 'Педикюр', 'Массаж'],
    },
    {
        email: 'client2@example.com',
        password: 'password123',
        fullName: 'Ольга Сидорова',
        interests: ['Парикмахер', 'Визаж', 'Брови'],
    },
    {
        email: 'client3@example.com',
        password: 'password123',
        fullName: 'Дарья Кузнецова',
        interests: ['Косметолог', 'Массаж', 'Шугаринг'],
    },
];

async function main() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await prisma.notification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.portfolioWork.deleteMany();
    await prisma.favoriteMaster.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.service.deleteMany();
    await prisma.master.deleteMany();
    await prisma.client.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    console.log('✅ Existing data cleared');

    // Create masters
    console.log('👩‍🔧 Creating masters...');
    for (const masterData of mastersData) {
        // Create user
        const hashedPassword = await hashPassword(masterData.password);
        const user = await prisma.user.create({
            data: {
                email: masterData.email,
                password: hashedPassword,
                role: UserRole.MASTER,
                status: 'ACTIVE',
            },
        });

        // Create master profile
        const master = await prisma.master.create({
            data: {
                userId: user.id,
                fullName: masterData.fullName,
                description: masterData.description,
                workFormat: masterData.workFormat,
                address: masterData.address,
                latitude: masterData.latitude,
                longitude: masterData.longitude,
                experienceYears: masterData.experienceYears,
                rating: masterData.rating,
                totalReviews: masterData.totalReviews,
                isVerified: masterData.isVerified,
                isActive: true,
                bookingConfirmationRequired: true,
                minCancellationTime: 24,
                maxBookingLeadTime: 30,
            },
        });

        console.log(`  ✓ Created master: ${masterData.fullName}`);

        // Create services
        for (const service of masterData.services) {
            await prisma.service.create({
                data: {
                    masterId: master.id,
                    name: service.name,
                    description: `Профессиональная услуга: ${service.name}`,
                    duration: service.duration,
                    price: service.price,
                    isActive: true,
                },
            });
        }

        // Create schedule
        for (const schedule of masterData.schedule) {
            await prisma.schedule.create({
                data: {
                    masterId: master.id,
                    dayOfWeek: schedule.dayOfWeek,
                    startTime: schedule.startTime,
                    endTime: schedule.endTime,
                    isActive: true,
                },
            });
        }
    }

    console.log(`✅ Created ${mastersData.length} masters with services and schedules`);

    // Create clients
    console.log('👥 Creating clients...');
    for (const clientData of clientsData) {
        const hashedPassword = await hashPassword(clientData.password);
        const user = await prisma.user.create({
            data: {
                email: clientData.email,
                password: hashedPassword,
                role: UserRole.CLIENT,
                status: 'ACTIVE',
            },
        });

        await prisma.client.create({
            data: {
                userId: user.id,
                fullName: clientData.fullName,
                interests: clientData.interests,
            },
        });

        console.log(`  ✓ Created client: ${clientData.fullName}`);
    }

    console.log(`✅ Created ${clientsData.length} clients`);

    // Summary
    const mastersCount = await prisma.master.count();
    const servicesCount = await prisma.service.count();
    const clientsCount = await prisma.client.count();
    const usersCount = await prisma.user.count();

    console.log('\n📊 Seeding Summary:');
    console.log(`  - Users: ${usersCount}`);
    console.log(`  - Masters: ${mastersCount}`);
    console.log(`  - Services: ${servicesCount}`);
    console.log(`  - Clients: ${clientsCount}`);
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test credentials:');
    console.log('  Masters:');
    mastersData.slice(0, 3).forEach(m => {
        console.log(`    ${m.email} / password123`);
    });
    console.log('  Clients:');
    clientsData.slice(0, 2).forEach(c => {
        console.log(`    ${c.email} / password123`);
    });
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
