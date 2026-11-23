/**
 * Seed the database with sample AVAILABLE cars so the marketplace isn't empty.
 *
 * Usage:
 *   node scripts/seed-cars.js
 *
 * Note: images are remote Unsplash URLs. Replace them with your own
 * Supabase URLs or add cars from /admin/cars/create (which uploads for real).
 */
const { PrismaClient } = require("@prisma/client");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

const makeImage = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

const sampleCars = [
  {
    make: "Toyota",
    model: "Camry XSE",
    year: 2023,
    price: 28500,
    mileage: 12400,
    color: "Pearl White",
    fuelType: "Hybrid",
    transmission: "Automatic",
    bodyType: "Sedan",
    seats: 5,
    description:
      "Well-maintained hybrid sedan with leather seats, panoramic roof and full service history.",
    featured: true,
    images: ["photo-1621007947382-bb3c3994e3fb"],
  },
  {
    make: "BMW",
    model: "X5 xDrive40i",
    year: 2022,
    price: 54900,
    mileage: 21000,
    color: "Black Sapphire",
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "SUV",
    seats: 5,
    description:
      "Premium SUV with adaptive suspension, Harman Kardon audio and driver assistance package.",
    featured: true,
    images: ["photo-1555215695-3004980ad54e"],
  },
  {
    make: "Tesla",
    model: "Model 3 Long Range",
    year: 2023,
    price: 41900,
    mileage: 8500,
    color: "Deep Blue",
    fuelType: "Electric",
    transmission: "Automatic",
    bodyType: "Sedan",
    seats: 5,
    description:
      "Dual-motor electric sedan, 358 mi range, autopilot enabled, one owner, free charging credits.",
    featured: true,
    images: ["photo-1560958089-b8a1929cea89"],
  },
  {
    make: "Volkswagen",
    model: "Golf GTI",
    year: 2021,
    price: 24900,
    mileage: 38000,
    color: "Tornado Red",
    fuelType: "Petrol",
    transmission: "Manual",
    bodyType: "Hatchback",
    seats: 5,
    description:
      "Fun hot hatch with 6-speed manual gearbox, sport seats and recent brake service.",
    featured: false,
    images: ["photo-1503376780353-7e6692767b70"],
  },
  {
    make: "Ford",
    model: "F-150 Lariat",
    year: 2022,
    price: 47200,
    mileage: 26500,
    color: "Oxford White",
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "Truck",
    seats: 6,
    description:
      "Crew cab pickup with tow package, heated seats and bed liner. Ready for work or weekend.",
    featured: false,
    images: ["photo-1595757670878-b3e67e4c7e26"],
  },
  {
    make: "Honda",
    model: "Civic Sport",
    year: 2023,
    price: 23900,
    mileage: 15200,
    color: "Sonic Grey",
    fuelType: "Petrol",
    transmission: "Automatic",
    bodyType: "Sedan",
    seats: 5,
    description:
      "Reliable commuter with Apple CarPlay, adaptive cruise control and excellent fuel economy.",
    featured: false,
    images: ["photo-1606664515524-ed2f786a0bd6"],
  },
  {
    make: "Mercedes-Benz",
    model: "C 300 4MATIC",
    year: 2022,
    price: 46800,
    mileage: 19800,
    color: "Selenite Grey",
    fuelType: "Hybrid",
    transmission: "Automatic",
    bodyType: "Sedan",
    seats: 5,
    description:
      "Elegant sedan with MBUX infotainment, ambient lighting and 360-degree camera.",
    featured: true,
    images: ["photo-1618843479313-40f8afb4b4d8"],
  },
  {
    make: "Kia",
    model: "Sportage EX",
    year: 2023,
    price: 27500,
    mileage: 9200,
    color: "Jungle Green",
    fuelType: "Hybrid",
    transmission: "Automatic",
    bodyType: "SUV",
    seats: 5,
    description:
      "Compact hybrid SUV with panoramic sunroof, heated seats and remaining factory warranty.",
    featured: false,
    images: ["photo-1533473359331-0135ef1b58bf"],
  },
];

async function main() {
  const existing = await prisma.car.count();
  if (existing > 0) {
    console.log(
      `Database already has ${existing} car(s). Skipping seed to avoid duplicates.`,
    );
    return;
  }

  for (const car of sampleCars) {
    await prisma.car.create({
      data: {
        id: uuidv4(),
        ...car,
        images: car.images.map(makeImage),
        status: "AVAILABLE",
      },
    });
  }

  console.log(`✅ Seeded ${sampleCars.length} cars.`);
}

main()
  .catch((e) => console.error("ERROR:", e.message))
  .finally(() => prisma.$disconnect());
