import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  AMENITIES,
  BEDROOM_OPTIONS,
  TIMELINE_OPTIONS,
  CONSTRUCTION_STAGE_TEMPLATE,
  LEAD_STATUSES,
} from "../src/lib/constants";
import { calculateMonthlyPayment, calculateAnnualFees, buildPaymentSchedule } from "../src/lib/finance";
import { DEFAULT_WEIGHTS } from "../src/lib/matching/weights";

const db = new PrismaClient();

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: readonly T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length > 0; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min: number, max: number, step = 1) {
  const value = min + Math.random() * (max - min);
  return Math.round(value / step) * step;
}

const FIRST_NAMES_M = [
  "Mohammed", "Ahmad", "Ali", "Omar", "Yousef", "Khaled", "Sami", "Tariq",
  "Rami", "Fadi", "Hani", "Nabil", "Iyad", "Bassam", "Munir", "Hassan",
  "Suleiman", "Karim", "Adnan", "Ziad",
];
const FIRST_NAMES_F = [
  "Lina", "Rana", "Dina", "Maha", "Nour", "Sara", "Huda", "Rasha", "Reem",
  "Salma", "Dana", "Yasmin", "Layla", "Amal", "Farah", "Hala", "Mira",
  "Nisreen", "Rula", "Wafa",
];
const LAST_NAMES = [
  "Al-Masri", "Khalil", "Sabbagh", "Odeh", "Hamdan", "Qasem", "Farhat",
  "Nasser", "Haddad", "Barghouti", "Awad", "Shaheen", "Tamimi", "Salem",
  "Jaber", "Zeidan", "Qassem", "Dweik", "Abu-Hantash", "Rimawi",
];

const LOCATIONS = [
  { name: "Ramallah", region: "Central West Bank" },
  { name: "Al-Bireh", region: "Central West Bank" },
  { name: "Nablus", region: "Northern West Bank" },
  { name: "Tulkarm", region: "Northern West Bank" },
  { name: "Jenin", region: "Northern West Bank" },
  { name: "Bethlehem", region: "Southern West Bank" },
  { name: "Hebron", region: "Southern West Bank" },
  { name: "Jericho", region: "Jordan Valley" },
];

async function main() {
  console.log("Wiping existing data...");
  await db.$transaction([
    db.analyticsEvent.deleteMany(),
    db.auditLog.deleteMany(),
    db.notification.deleteMany(),
    db.payment.deleteMany(),
    db.paymentPlan.deleteMany(),
    db.reservation.deleteMany(),
    db.projectParticipant.deleteMany(),
    db.projectUpdate.deleteMany(),
    db.constructionStage.deleteMany(),
    db.matchingResult.deleteMany(),
    db.projectFeasibility.deleteMany(),
    db.apartment.deleteMany(),
    db.project.deleteMany(),
    db.land.deleteMany(),
    db.demandSegment.deleteMany(),
    db.preferenceLocation.deleteMany(),
    db.propertyPreference.deleteMany(),
    db.matchingConfiguration.deleteMany(),
    db.user.deleteMany(),
    db.location.deleteMany(),
  ]);

  console.log("Seeding locations...");
  const locations = await Promise.all(
    LOCATIONS.map((l) => db.location.create({ data: { name: l.name, region: l.region } }))
  );
  const locByName = Object.fromEntries(locations.map((l) => [l.name, l]));

  console.log("Seeding matching configuration...");
  await db.matchingConfiguration.create({
    data: { name: "Default weights", weights: JSON.stringify(DEFAULT_WEIGHTS), isActive: true },
  });

  console.log("Seeding admin + demo accounts...");
  const adminHash = await bcrypt.hash("Admin123!", 10);
  const demoHash = await bcrypt.hash("Demo1234!", 10);

  const admin = await db.user.create({
    data: {
      email: "admin@cascade.dev",
      firstName: "Admin",
      lastName: "Cascade",
      passwordHash: adminHash,
      role: "ADMIN",
      onboardingDone: true,
      emailVerifiedAt: new Date(),
      leadStatus: "COMPLETED",
    },
  });

  const demoUser = await db.user.create({
    data: {
      email: "demo@cascade.dev",
      firstName: "Yousef",
      lastName: "Hamdan",
      phone: "+970599000001",
      passwordHash: demoHash,
      role: "CUSTOMER",
      onboardingDone: true,
      emailVerifiedAt: new Date(),
      leadStatus: "RESERVED",
    },
  });

  console.log("Seeding bulk demand data (customers + preferences)...");
  const bulkUsers = [admin, demoUser];
  const bedroomWeighted = ["1", "2", "2", "3", "3", "3", "4_PLUS"];
  const timelineWeighted = ["ASAP", "WITHIN_1_YEAR", "WITHIN_1_YEAR", "Y2_3", "Y2_3", "Y3_5", "FLEXIBLE"];

  for (let i = 0; i < 118; i++) {
    const isFemale = Math.random() > 0.5;
    const firstName = pick(isFemale ? FIRST_NAMES_F : FIRST_NAMES_M);
    const lastName = pick(LAST_NAMES);
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/[^a-z]/g, "")}${i}@example.com`;

    const bedrooms = pick(bedroomWeighted);
    const bedroomBase = BEDROOM_OPTIONS.find((b) => b.value === bedrooms)!.numeric;
    const minSize = bedroomBase * 35 + randInt(-10, 5);
    const maxSize = minSize + randInt(20, 45);
    const monthlyMin = 200 + bedroomBase * 45 + randInt(-30, 30);
    const monthlyMax = monthlyMin + randInt(60, 160);
    const downPaymentMin = 5000 + bedroomBase * 900 + randInt(-1000, 1000);
    const downPaymentMax = downPaymentMin + randInt(1500, 4000);
    const durationMinYears = randInt(4, 6);
    const durationMaxYears = durationMinYears + randInt(1, 3);
    const timeline = pick(timelineWeighted);
    const amenities = pickN(
      AMENITIES.map((a) => a.key),
      randInt(1, 4)
    );
    const selectedLocations = pickN(locations, randInt(1, 2));
    const leadStatus = pick(LEAD_STATUSES.filter((s) => s !== "COMPLETED"));

    const user = await db.user.create({
      data: {
        email,
        firstName,
        lastName,
        passwordHash: demoHash,
        role: "CUSTOMER",
        onboardingDone: true,
        emailVerifiedAt: new Date(),
        leadStatus,
        preference: {
          create: {
            propertyType: "APARTMENT",
            bedrooms,
            minSize,
            maxSize,
            downPaymentMin,
            downPaymentMax,
            monthlyMin,
            monthlyMax,
            durationMinYears,
            durationMaxYears,
            timeline,
            amenities: JSON.stringify(amenities),
            locations: {
              create: selectedLocations.map((l) => ({ locationId: l.id })),
            },
          },
        },
      },
    });
    bulkUsers.push(user);
  }

  // Give the demo user a rich, realistic property profile (Ramallah, 3BR).
  await db.propertyPreference.create({
    data: {
      userId: demoUser.id,
      propertyType: "APARTMENT",
      bedrooms: "3",
      minSize: 120,
      maxSize: 150,
      downPaymentMin: 7000,
      downPaymentMax: 10000,
      monthlyMin: 300,
      monthlyMax: 450,
      durationMinYears: 5,
      durationMaxYears: 7,
      timeline: "Y2_3",
      amenities: JSON.stringify(["parking", "elevator", "balcony"]),
      locations: { create: [{ locationId: locByName["Ramallah"].id }] },
    },
  });

  console.log("Seeding lands...");
  const landDefs = [
    { name: "Ramallah Heights Land", location: "Ramallah", area: 620, price: 310000, buildable: 2600, floors: 6, apts: 20, parking: 20, status: "ACQUIRED" },
    { name: "Al-Bireh Central Plot", location: "Al-Bireh", area: 480, price: 240000, buildable: 2000, floors: 5, apts: 16, parking: 16, status: "ACQUIRED" },
    { name: "Nablus Old City Edge", location: "Nablus", area: 550, price: 220000, buildable: 2200, floors: 5, apts: 15, parking: 14, status: "ACQUIRED" },
    { name: "Tulkarm Gateway Plot", location: "Tulkarm", area: 700, price: 180000, buildable: 2800, floors: 6, apts: 18, parking: 18, status: "ACQUIRED" },
    { name: "Jenin North Parcel", location: "Jenin", area: 600, price: 150000, buildable: 2400, floors: 6, apts: 16, parking: 16, status: "AVAILABLE" },
    { name: "Bethlehem Hillside", location: "Bethlehem", area: 500, price: 260000, buildable: 1900, floors: 5, apts: 13, parking: 12, status: "AVAILABLE" },
    { name: "Hebron Industrial Edge", location: "Hebron", area: 650, price: 170000, buildable: 2500, floors: 6, apts: 17, parking: 17, status: "UNDER_REVIEW" },
    { name: "Jericho Valley Plot", location: "Jericho", area: 800, price: 140000, buildable: 2600, floors: 5, apts: 14, parking: 10, status: "AVAILABLE" },
  ];
  const lands = await Promise.all(
    landDefs.map((l) =>
      db.land.create({
        data: {
          name: l.name,
          locationId: locByName[l.location].id,
          area: l.area,
          price: l.price,
          expectedBuildableArea: l.buildable,
          allowedFloors: l.floors,
          potentialApartments: l.apts,
          parkingSpaces: l.parking,
          status: l.status,
          notes: "Seeded demo land opportunity.",
        },
      })
    )
  );
  const landByName = Object.fromEntries(lands.map((l) => [l.name, l]));

  console.log("Seeding projects + apartments...");
  const priceRatePerSqm: Record<string, number> = {
    Ramallah: 320, "Al-Bireh": 300, Nablus: 280, Tulkarm: 260, Jenin: 250,
  };

  const projectDefs = [
    {
      name: "Modern Heights", location: "Ramallah", land: "Ramallah Heights Land",
      status: "CONSTRUCTION", floors: 6, deliveryMonths: 20,
      amenities: ["parking", "elevator", "balcony", "smart_home"], theme: "slate",
    },
    {
      name: "City View Residences", location: "Al-Bireh", land: "Al-Bireh Central Plot",
      status: "FUNDRAISING", floors: 5, deliveryMonths: 34,
      amenities: ["parking", "elevator", "storage"], theme: "indigo",
    },
    {
      name: "Cascade Gardens", location: "Nablus", land: "Nablus Old City Edge",
      status: "LAND_SECURED", floors: 5, deliveryMonths: 40,
      amenities: ["parking", "garden", "balcony"], theme: "emerald",
    },
    {
      name: "Horizon Towers", location: "Ramallah", land: undefined,
      status: "PLANNING", floors: 8, deliveryMonths: 50,
      amenities: ["parking", "elevator", "smart_home", "storage"], theme: "amber",
    },
    {
      name: "Olive Residence", location: "Tulkarm", land: "Tulkarm Gateway Plot",
      status: "FINISHING", floors: 6, deliveryMonths: 8,
      amenities: ["parking", "balcony", "garden"], theme: "teal",
    },
    {
      name: "Jenin Family Homes", location: "Jenin", land: undefined,
      status: "PLANNING", floors: 6, deliveryMonths: 44,
      amenities: ["parking", "elevator", "master_bedroom"], theme: "rose",
    },
  ];

  const projects = [];
  for (const p of projectDefs) {
    const delivery = new Date();
    delivery.setMonth(delivery.getMonth() + p.deliveryMonths);

    const land = p.land ? landByName[p.land] : null;
    const rate = priceRatePerSqm[p.location] ?? 270;
    const constructionCostEstimate = (land?.expectedBuildableArea ?? p.floors * 2 * 130) * 650;
    const landCostEstimate = land?.price ?? 200000;
    const otherCostsEstimate = (landCostEstimate + constructionCostEstimate) * 0.08;

    const totalApartments = p.floors * 2;
    const project = await db.project.create({
      data: {
        name: p.name,
        slug: p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: `${p.name} is a Cascade group-development project in ${p.location}. Participants join the project, and apartments are allocated as the group forms — from land acquisition through design, construction, and handover.`,
        locationId: locByName[p.location].id,
        landId: land?.id,
        status: p.status,
        totalFloors: p.floors,
        totalApartments,
        parkingAvailable: true,
        elevatorAvailable: p.amenities.includes("elevator"),
        amenities: JSON.stringify(p.amenities),
        coverTheme: p.theme,
        estimatedDeliveryDate: delivery,
        landCostEstimate,
        constructionCostEstimate,
        otherCostsEstimate,
      },
    });
    projects.push(project);

    const bedroomCycle = [2, 3, 3, 4];
    for (let floor = 1; floor <= p.floors; floor++) {
      for (const wing of ["A", "B"]) {
        const bedrooms = bedroomCycle[(floor + (wing === "B" ? 1 : 0)) % bedroomCycle.length];
        const area =
          bedrooms === 2 ? randFloat(90, 108, 1) : bedrooms === 3 ? randFloat(118, 142, 1) : randFloat(148, 172, 1);
        const price = Math.round(area * rate);
        const downPayment = Math.round(price * 0.2);
        const durationMonths = pick([60, 72, 84, 96]);
        const { monthlyPaymentDisplay } = calculateMonthlyPayment({ totalPrice: price, downPayment, durationMonths });
        const fees = calculateAnnualFees({ price });

        await db.apartment.create({
          data: {
            projectId: project.id,
            code: `${wing}${floor}01`,
            floor,
            area,
            bedrooms,
            bathrooms: bedrooms >= 3 ? 2 : 1,
            hasBalcony: p.amenities.includes("balcony") || Math.random() > 0.4,
            view: pick(["City", "Garden", "Street", "Panoramic"]),
            parkingIncluded: Math.random() > 0.2,
            features: JSON.stringify(pickN(AMENITIES.map((a) => a.key), randInt(1, 3))),
            price,
            downPayment,
            monthlyPayment: monthlyPaymentDisplay,
            durationMonths,
            status: "AVAILABLE",
            serviceFeeAnnual: fees.serviceFeeAnnual,
            managementFeeAnnual: fees.managementFeeAnnual,
            maintenanceFeeAnnual: fees.maintenanceFeeAnnual,
          },
        });
      }
    }

    // Construction stages for projects that have progressed.
    const stageProgress: Record<string, number> = {
      DRAFT: 0, PLANNING: 0, FUNDRAISING: 1, LAND_SECURED: 2,
      CONSTRUCTION: 4, FINISHING: 6, COMPLETED: 7, HANDOVER: 7,
    };
    const completedCount = stageProgress[p.status] ?? 0;
    for (let i = 0; i < CONSTRUCTION_STAGE_TEMPLATE.length; i++) {
      const isDone = i < completedCount;
      const isCurrent = i === completedCount;
      const plannedDate = new Date();
      plannedDate.setMonth(plannedDate.getMonth() - (completedCount - i) * 2);
      await db.constructionStage.create({
        data: {
          projectId: project.id,
          name: CONSTRUCTION_STAGE_TEMPLATE[i],
          sequence: i,
          status: isDone ? "COMPLETE" : isCurrent ? "IN_PROGRESS" : "PENDING",
          plannedDate,
          actualDate: isDone ? plannedDate : null,
          description: isDone
            ? `${CONSTRUCTION_STAGE_TEMPLATE[i]} completed on schedule.`
            : isCurrent
              ? `${CONSTRUCTION_STAGE_TEMPLATE[i]} currently in progress.`
              : null,
        },
      });
    }

    await db.projectUpdate.create({
      data: {
        projectId: project.id,
        title: `${p.name}: progress update`,
        body: `We're excited to share that ${p.name} is progressing well. Current status: ${p.status.replace("_", " ").toLowerCase()}.`,
      },
    });
  }

  console.log("Seeding reservations, payment plans, and participants...");
  const fundableProjects = projects.filter((p) => ["FUNDRAISING", "LAND_SECURED", "CONSTRUCTION", "FINISHING"].includes(p.status));
  const customerPool = bulkUsers.filter((u) => u.role === "CUSTOMER" && u.id !== demoUser.id);

  let reservationCount = 0;
  const usedParticipation = new Set<string>();

  async function reserveApartment(userId: string, projectId: string, apartmentId: string, paidRatio: number) {
    const participationKey = `${userId}:${projectId}`;
    if (usedParticipation.has(participationKey)) return null;

    const apartment = await db.apartment.findUnique({ where: { id: apartmentId } });
    if (!apartment || apartment.status !== "AVAILABLE") return null;

    usedParticipation.add(participationKey);

    const code = `CSC-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - randInt(0, 4));

    const reservation = await db.reservation.create({
      data: {
        code,
        userId,
        projectId,
        apartmentId,
        status: "CONFIRMED",
        confirmedAt: startDate,
        createdAt: startDate,
      },
    });

    await db.apartment.update({ where: { id: apartmentId }, data: { status: "RESERVED" } });
    await db.projectParticipant.create({
      data: { projectId, userId, apartmentId, status: "ALLOCATED", joinedAt: startDate },
    });

    const schedule = buildPaymentSchedule({
      totalPrice: apartment.price,
      downPayment: apartment.downPayment,
      durationMonths: apartment.durationMonths,
      startDate,
    });

    const plan = await db.paymentPlan.create({
      data: {
        reservationId: reservation.id,
        totalAmount: apartment.price,
        downPayment: apartment.downPayment,
        remainingAmount: apartment.price - apartment.downPayment,
        monthlyAmount: calculateMonthlyPayment({
          totalPrice: apartment.price,
          downPayment: apartment.downPayment,
          durationMonths: apartment.durationMonths,
        }).monthlyPaymentDisplay,
        durationMonths: apartment.durationMonths,
        startDate,
      },
    });

    const paidCount = Math.floor(schedule.length * paidRatio);
    for (let i = 0; i < schedule.length; i++) {
      const entry = schedule[i];
      const isPaid = i < paidCount;
      await db.payment.create({
        data: {
          paymentPlanId: plan.id,
          label: entry.label,
          amount: entry.amount,
          dueDate: entry.dueDate,
          paidDate: isPaid ? entry.dueDate : null,
          status: isPaid ? "PAID" : entry.dueDate < new Date() ? "OVERDUE" : "UPCOMING",
        },
      });
    }

    await db.notification.create({
      data: {
        userId,
        type: "RESERVATION",
        title: "Reservation confirmed",
        body: `Your reservation for apartment ${apartment.code} is confirmed. Welcome to the project!`,
      },
    });

    reservationCount++;
    return reservation;
  }

  // Demo user reservation — flagship path used for the guided demo.
  const flagship = projects.find((p) => p.name === "Modern Heights")!;
  const flagshipApartment = await db.apartment.findFirst({
    where: { projectId: flagship.id, status: "AVAILABLE", bedrooms: 3 },
    orderBy: { floor: "asc" },
  });
  if (flagshipApartment) {
    await reserveApartment(demoUser.id, flagship.id, flagshipApartment.id, 0.35);
    await db.notification.createMany({
      data: [
        {
          userId: demoUser.id,
          type: "CONSTRUCTION_UPDATE",
          title: "Structure work underway",
          body: "Modern Heights has completed its foundation and structure work is progressing on schedule.",
        },
        {
          userId: demoUser.id,
          type: "PAYMENT_REMINDER",
          title: "Upcoming installment",
          body: "Your next monthly installment is due soon. Visit Payments to review your schedule.",
        },
        {
          userId: demoUser.id,
          type: "ANNOUNCEMENT",
          title: "Welcome to Modern Heights",
          body: "Thanks for joining the project. Track construction and payments any time from My Project.",
        },
      ],
    });
    await db.user.update({ where: { id: demoUser.id }, data: { leadStatus: "RESERVED" } });
  }

  // Spread ~22+ more reservations across fundable projects (a handful of
  // attempts are skipped when a user already joined that project or the
  // picked apartment is no longer available — the loop count accounts for that).
  for (let i = 0; i < 40; i++) {
    const project = pick(fundableProjects);
    const apartment = await db.apartment.findFirst({ where: { projectId: project.id, status: "AVAILABLE" } });
    const user = pick(customerPool);
    if (!apartment) continue;
    const result = await reserveApartment(user.id, project.id, apartment.id, Math.random());
    if (result) {
      await db.user.update({ where: { id: user.id }, data: { leadStatus: "RESERVED" } });
    }
  }

  console.log("Seeding a few demand segments...");
  await db.demandSegment.createMany({
    data: [
      { name: "Ramallah · 3BR · Mid budget", locationId: locByName["Ramallah"].id, minBedrooms: "3", maxBedrooms: "3", minBudget: 300, maxBudget: 400 },
      { name: "Al-Bireh · 2BR · Starter budget", locationId: locByName["Al-Bireh"].id, minBedrooms: "2", maxBedrooms: "2", minBudget: 200, maxBudget: 320 },
      { name: "Nablus · 4+BR · Family", locationId: locByName["Nablus"].id, minBedrooms: "4_PLUS", maxBedrooms: "4_PLUS", minBudget: 350, maxBudget: 550 },
    ],
  });

  console.log("Seeding analytics events...");
  for (const u of customerPool.slice(0, 60)) {
    await db.analyticsEvent.createMany({
      data: [
        { userId: u.id, name: "onboarding_completed" },
        { userId: u.id, name: "property_profile_created" },
      ],
    });
  }

  console.log(`Done. Seeded ${bulkUsers.length} users, ${projects.length} projects, ${lands.length} lands, ${reservationCount} reservations.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
