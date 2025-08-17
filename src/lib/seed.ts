import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

async function main() {
  // Criar usuário admin
  const hashedPassword = await bcrypt.hash("admin123", 12)
  const admin = await db.user.upsert({
    where: { email: "admin@noronha.com" },
    update: {},
    create: {
      email: "admin@noronha.com",
      name: "Administrador",
      password: hashedPassword,
      role: "ADMIN"
    }
  })

  // Criar usuário supervisor
  const supervisorPassword = await bcrypt.hash("supervisor123", 12)
  const supervisor = await db.user.upsert({
    where: { email: "supervisor@noronha.com" },
    update: {},
    create: {
      email: "supervisor@noronha.com",
      name: "Supervisor",
      password: supervisorPassword,
      role: "SUPERVISOR"
    }
  })

  // Criar usuário motorista
  const driverPassword = await bcrypt.hash("motorista123", 12)
  const driver = await db.user.upsert({
    where: { email: "motorista@noronha.com" },
    update: {},
    create: {
      email: "motorista@noronha.com",
      name: "Motorista",
      password: driverPassword,
      role: "DRIVER"
    }
  })

  // Criar lixeiras de exemplo em Fernando de Noronha
  const trashBins = [
    {
      code: "FN001",
      name: "Lixeira Praia do Cachorro",
      location: "Praia do Cachorro",
      latitude: -3.8494,
      longitude: -32.4258,
      currentLevel: 85,
      batteryLevel: 95
    },
    {
      code: "FN002",
      name: "Lixeira Praia da Conceição",
      location: "Praia da Conceição",
      latitude: -3.8419,
      longitude: -32.4231,
      currentLevel: 45,
      batteryLevel: 88
    },
    {
      code: "FN003",
      name: "Lixeira Vila dos Remédios",
      location: "Vila dos Remédios",
      latitude: -3.8452,
      longitude: -32.4197,
      currentLevel: 92,
      batteryLevel: 72
    },
    {
      code: "FN004",
      name: "Lixeira Porto Santo",
      location: "Porto Santo",
      latitude: -3.8541,
      longitude: -32.4156,
      currentLevel: 30,
      batteryLevel: 100
    },
    {
      code: "FN005",
      name: "Lixeira Praia do Sueste",
      location: "Praia do Sueste",
      latitude: -3.8356,
      longitude: -32.4389,
      currentLevel: 78,
      batteryLevel: 45
    },
    {
      code: "FN006",
      name: "Lixeira Praia do Leão",
      location: "Praia do Leão",
      latitude: -3.8289,
      longitude: -32.4312,
      currentLevel: 15,
      batteryLevel: 90
    },
    {
      code: "FN007",
      name: "Lixeira Praia da Biboca",
      location: "Praia da Biboca",
      latitude: -3.8478,
      longitude: -32.4291,
      currentLevel: 88,
      batteryLevel: 15
    },
    {
      code: "FN008",
      name: "Lixeira Praia do Sancho",
      location: "Praia do Sancho",
      latitude: -3.8214,
      longitude: -32.4345,
      currentLevel: 67,
      batteryLevel: 82
    }
  ]

  for (const binData of trashBins) {
    await db.trashBin.upsert({
      where: { code: binData.code },
      update: {},
      create: binData
    })
  }

  console.log("Seed concluído com sucesso!")
  console.log("Usuários criados:")
  console.log("Admin: admin@noronha.com / admin123")
  console.log("Supervisor: supervisor@noronha.com / supervisor123")
  console.log("Motorista: motorista@noronha.com / motorista123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })