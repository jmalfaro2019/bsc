import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

import bscData from "../src/data/bscData.json";
import { perspectiveSchema } from "bsc-shared";

const data = perspectiveSchema.array().parse(bscData.perspectives);

async function main() {
  console.log("Seeding database...");

  // Create default admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      role: "admin",
    },
  });
  console.log("Created admin user (username: admin, password: admin123)");

  // Seed perspectives, projects, and activities
  for (const [index, perspective] of data.entries()) {
    const createdPerspective = await prisma.perspective.upsert({
      where: { id: perspective.id },
      update: {
        name: perspective.name,
        objective: perspective.objective,
        weightage: perspective.weightage,
        order: index,
      },
      create: {
        id: perspective.id,
        name: perspective.name,
        objective: perspective.objective,
        weightage: perspective.weightage,
        order: index,
      },
    });

    for (const [pIndex, project] of perspective.projects.entries()) {
      const createdProject = await prisma.project.upsert({
        where: { id: project.id },
        update: {
          name: project.name,
          weightage: project.weightage,
          strategy: project.strategy,
          detail: project.detail,
          order: pIndex,
          perspectiveId: createdPerspective.id,
        },
        create: {
          id: project.id,
          name: project.name,
          weightage: project.weightage,
          strategy: project.strategy,
          detail: project.detail,
          order: pIndex,
          perspectiveId: createdPerspective.id,
        },
      });

      for (const [aIndex, activity] of project.activities.entries()) {
        await prisma.activity.upsert({
          where: { id: activity.id },
          update: {
            name: activity.name,
            weightage: activity.weightage,
            progress: activity.progress,
            responsibleProcess: activity.responsibleProcess,
            complianceDate: activity.complianceDate,
            realizedActivities: activity.realizedActivities,
            order: aIndex,
            projectId: createdProject.id,
          },
          create: {
            id: activity.id,
            name: activity.name,
            weightage: activity.weightage,
            progress: activity.progress,
            responsibleProcess: activity.responsibleProcess,
            complianceDate: activity.complianceDate,
            realizedActivities: activity.realizedActivities,
            order: aIndex,
            projectId: createdProject.id,
          },
        });
      }
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });