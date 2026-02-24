-- CreateTable
CREATE TABLE "Surgery" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patientId" TEXT NOT NULL,
    "patientName" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "doctorName" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "hospitalName" TEXT NOT NULL,
    "procedure" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "surgeryId" TEXT NOT NULL,
    CONSTRAINT "Comment_surgeryId_fkey" FOREIGN KEY ("surgeryId") REFERENCES "Surgery" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "fastingTime" TEXT NOT NULL,
    "estimatedDuration" TEXT NOT NULL,
    "anesthesiaType" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "materials" TEXT NOT NULL,
    "bloodRequirement" TEXT NOT NULL,
    "teamSize" TEXT NOT NULL,
    "recoveryTimePACU" TEXT NOT NULL,
    "recoveryTimeICU" TEXT NOT NULL,
    "hospitalizationTime" TEXT NOT NULL,
    "homeRecoveryTime" TEXT NOT NULL,
    "suggestedCertificateTime" TEXT NOT NULL,
    "consentForm" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ProcedureReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user" TEXT NOT NULL,
    "avatar" TEXT,
    "content" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "procedureId" TEXT NOT NULL,
    CONSTRAINT "ProcedureReport_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_code_key" ON "Procedure"("code");
