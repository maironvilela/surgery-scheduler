/**
 * lib/prisma-preview.ts
 *
 * Cliente de banco de dados para ambiente de preview/demonstração.
 * Usa better-sqlite3 diretamente para criar um banco relacional em memória
 * (persistido em arquivo temporário, recriado a cada restart do servidor).
 *
 * A interface exportada replica a API do Prisma Client para que os mesmos
 * actions funcionem sem nenhuma mudança.
 */

import Database from 'better-sqlite3'
import path from 'path'
import os from 'os'
import fs from 'fs'

// ─── Arquivo temporário (apagado a cada restart) ──────────────────────────────
const PREVIEW_DB_PATH = path.join(os.tmpdir(), 'surgery-scheduler-preview.db')

// ─── Gerador de IDs simples (compatível com cuid estilo Prisma) ───────────────
function cuid(): string {
    return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

// ─── Criação do schema SQLite ─────────────────────────────────────────────────
function createSchema(db: InstanceType<typeof Database>) {
    db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS "Doctor" (
        "id"        TEXT     NOT NULL PRIMARY KEY,
        "crm"       TEXT     NOT NULL UNIQUE,
        "name"      TEXT     NOT NULL,
        "specialty" TEXT     NOT NULL,
        "photoUrl"  TEXT,
        "status"    TEXT     NOT NULL DEFAULT 'active',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Hospital" (
        "id"             TEXT     NOT NULL PRIMARY KEY,
        "name"           TEXT     NOT NULL,
        "cep"            TEXT     NOT NULL,
        "street"         TEXT     NOT NULL,
        "number"         TEXT     NOT NULL,
        "complement"     TEXT,
        "neighborhood"   TEXT     NOT NULL,
        "city"           TEXT     NOT NULL,
        "state"          TEXT     NOT NULL,
        "referencePoint" TEXT,
        "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "HospitalContact" (
        "id"         TEXT    NOT NULL PRIMARY KEY,
        "type"       TEXT    NOT NULL,
        "value"      TEXT    NOT NULL,
        "label"      TEXT,
        "isPrimary"  INTEGER NOT NULL DEFAULT 0,
        "hospitalId" TEXT    NOT NULL,
        FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "Patient" (
        "id"           TEXT     NOT NULL PRIMARY KEY,
        "name"         TEXT     NOT NULL,
        "insurance"    TEXT,
        "plan"         TEXT,
        "birthDate"    TEXT,
        "gender"       TEXT     NOT NULL DEFAULT 'other',
        "cep"          TEXT,
        "street"       TEXT,
        "number"       TEXT,
        "complement"   TEXT,
        "neighborhood" TEXT,
        "city"         TEXT,
        "state"        TEXT,
        "phone"        TEXT,
        "email"        TEXT,
        "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Consultation" (
        "id"           TEXT     NOT NULL PRIMARY KEY,
        "patientName"  TEXT     NOT NULL,
        "phone"        TEXT,
        "status"       TEXT     NOT NULL DEFAULT 'Pendente',
        "time"         TEXT     NOT NULL,
        "whatsappSent" INTEGER  NOT NULL DEFAULT 0,
        "isArchived"   INTEGER  NOT NULL DEFAULT 0,
        "date"         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "insurance"    TEXT,
        "plan"         TEXT,
        "observations" TEXT,
        "doctorId"     TEXT,
        "hospitalId"   TEXT,
        "patientId"    TEXT,
        FOREIGN KEY ("doctorId")   REFERENCES "Doctor"("id"),
        FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id"),
        FOREIGN KEY ("patientId")  REFERENCES "Patient"("id")
    );

    CREATE TABLE IF NOT EXISTS "Surgery" (
        "id"           TEXT     NOT NULL PRIMARY KEY,
        "patientId"    TEXT     NOT NULL,
        "patientName"  TEXT     NOT NULL,
        "doctorId"     TEXT     NOT NULL,
        "doctorName"   TEXT     NOT NULL,
        "hospitalId"   TEXT     NOT NULL,
        "hospitalName" TEXT     NOT NULL,
        "procedure"    TEXT     NOT NULL,
        "date"         TEXT     NOT NULL,
        "startTime"    TEXT     NOT NULL,
        "endTime"      TEXT     NOT NULL,
        "room"         TEXT     NOT NULL,
        "status"       TEXT     NOT NULL DEFAULT 'scheduled',
        "notes"        TEXT,
        "createdAt"    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "Comment" (
        "id"        TEXT NOT NULL PRIMARY KEY,
        "user"      TEXT NOT NULL,
        "date"      TEXT NOT NULL,
        "content"   TEXT NOT NULL,
        "surgeryId" TEXT NOT NULL,
        FOREIGN KEY ("surgeryId") REFERENCES "Surgery"("id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "Procedure" (
        "id"                       TEXT     NOT NULL PRIMARY KEY,
        "code"                     TEXT     NOT NULL UNIQUE,
        "name"                     TEXT     NOT NULL,
        "specialty"                TEXT     NOT NULL,
        "fastingTime"              TEXT     NOT NULL,
        "estimatedDuration"        TEXT     NOT NULL,
        "anesthesiaType"           TEXT     NOT NULL,
        "equipment"                TEXT     NOT NULL,
        "materials"                TEXT     NOT NULL,
        "bloodRequirement"         TEXT     NOT NULL,
        "teamSize"                 TEXT     NOT NULL,
        "recoveryTimePACU"         TEXT     NOT NULL,
        "recoveryTimeICU"          TEXT     NOT NULL,
        "hospitalizationTime"      TEXT     NOT NULL,
        "homeRecoveryTime"         TEXT     NOT NULL,
        "suggestedCertificateTime" TEXT     NOT NULL,
        "consentForm"              INTEGER  NOT NULL DEFAULT 0,
        "createdAt"                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "ProcedureReport" (
        "id"          TEXT NOT NULL PRIMARY KEY,
        "user"        TEXT NOT NULL,
        "avatar"      TEXT,
        "content"     TEXT NOT NULL,
        "date"        TEXT NOT NULL,
        "procedureId" TEXT NOT NULL,
        FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "User" (
        "id"                 TEXT     NOT NULL PRIMARY KEY,
        "email"              TEXT     NOT NULL UNIQUE,
        "name"               TEXT     NOT NULL,
        "passwordHash"       TEXT     NOT NULL,
        "role"               TEXT     NOT NULL DEFAULT 'user',
        "mustChangePassword" INTEGER  NOT NULL DEFAULT 1,
        "createdAt"          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS "appointments" (
        "id"                   TEXT     NOT NULL PRIMARY KEY,
        "patient_name"         TEXT     NOT NULL,
        "patient_phone"        TEXT     NOT NULL,
        "insurance"            TEXT,
        "plan"                 TEXT,
        "appointment_type"     TEXT     DEFAULT 'Convênio',
        "amount"               TEXT,
        "doctor_name"          TEXT     NOT NULL,
        "specialty"            TEXT     NOT NULL,
        "appointment_date"     TEXT     NOT NULL,
        "appointment_time"     TEXT     NOT NULL,
        "full_datetime_string" TEXT     NOT NULL,
        "location_name"        TEXT     NOT NULL,
        "location_address"     TEXT     NOT NULL,
        "from_website"         INTEGER  NOT NULL DEFAULT 0,
        "patient_source"       TEXT,
        "whatsapp_message"     TEXT     NOT NULL,
        "whatsapp_sent"        INTEGER  NOT NULL DEFAULT 0,
        "status"               TEXT     NOT NULL DEFAULT 'AGENDADO',
        "created_by"           TEXT     DEFAULT 'Atendente',
        "created_at"           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at"           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS "idx_appointments_phone"  ON "appointments"("patient_phone");
    CREATE INDEX IF NOT EXISTS "idx_appointments_date"   ON "appointments"("appointment_date");
    CREATE INDEX IF NOT EXISTS "idx_appointments_doctor" ON "appointments"("doctor_name");
    `)
}

// ─── Seed com dados de demonstração ──────────────────────────────────────────
function seedDb(db: InstanceType<typeof Database>) {
    const now = new Date().toISOString()
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    // Doctors
    const doctorIds = [cuid(), cuid(), cuid(), cuid(), cuid()]
    const doctors = [
        { id: doctorIds[0], crm: 'MG-12345', name: 'Dr. Ricardo Almeida', specialty: 'Ortopedia' },
        { id: doctorIds[1], crm: 'MG-23456', name: 'Dra. Fernanda Costa', specialty: 'Cardiologia' },
        { id: doctorIds[2], crm: 'MG-34567', name: 'Dr. Marcos Souza', specialty: 'Neurologia' },
        { id: doctorIds[3], crm: 'MG-45678', name: 'Dra. Juliana Martins', specialty: 'Ginecologia' },
        { id: doctorIds[4], crm: 'MG-56789', name: 'Dr. Paulo Henrique Rocha', specialty: 'Urologia' },
    ]
    const stmtDoctor = db.prepare(`INSERT INTO "Doctor" (id,crm,name,specialty,status,createdAt,updatedAt) VALUES (?,?,?,?,'active',?,?)`)
    doctors.forEach(d => stmtDoctor.run(d.id, d.crm, d.name, d.specialty, now, now))

    // Hospitals
    const hIds = [cuid(), cuid(), cuid()]
    const hospitals = [
        { id: hIds[0], name: 'Hospital Santa Casa de Misericórdia', cep: '30150-221', street: 'Rua Domingos Vieira', number: '590', neighborhood: 'Santa Efigênia', city: 'Belo Horizonte', state: 'MG' },
        { id: hIds[1], name: 'Hospital Mater Dei', cep: '30315-901', street: 'Rua Gonçalves Dias', number: '2700', neighborhood: 'Santo Agostinho', city: 'Belo Horizonte', state: 'MG' },
        { id: hIds[2], name: 'Hospital Lifecenter', cep: '30310-909', street: 'Rua Alameda Ezequiel Dias', number: '345', neighborhood: 'Centro', city: 'Belo Horizonte', state: 'MG' },
    ]
    const stmtHosp = db.prepare(`INSERT INTO "Hospital" (id,name,cep,street,number,neighborhood,city,state,createdAt) VALUES (?,?,?,?,?,?,?,?,?)`)
    hospitals.forEach(h => stmtHosp.run(h.id, h.name, h.cep, h.street, h.number, h.neighborhood, h.city, h.state, now))

    const stmtContact = db.prepare(`INSERT INTO "HospitalContact" (id,type,value,label,isPrimary,hospitalId) VALUES (?,?,?,?,?,?)`)
    stmtContact.run(cuid(), 'phone', '(31) 3238-8000', 'Central', 1, hIds[0])
    stmtContact.run(cuid(), 'email', 'contato@santacasa.org.br', 'Geral', 1, hIds[0])
    stmtContact.run(cuid(), 'phone', '(31) 3339-9000', 'Agendamento', 1, hIds[1])
    stmtContact.run(cuid(), 'email', 'agendamento@materdei.com.br', 'Agendamento', 1, hIds[1])
    stmtContact.run(cuid(), 'phone', '(31) 3516-9000', 'Recepção', 1, hIds[2])

    // Patients
    const pIds = Array.from({ length: 12 }, () => cuid())
    const patients = [
        { id: pIds[0], name: 'Ana Paula Silva', phone: '31987654321', insurance: 'Unimed', plan: 'Nacional', gender: 'female', birthDate: '1985-03-15', cep: '30130-000', street: 'Av. Afonso Pena', number: '100', neighborhood: 'Centro', city: 'Belo Horizonte', state: 'MG', email: 'ana.silva@email.com' },
        { id: pIds[1], name: 'Carlos Eduardo Ferreira', phone: '31976543210', insurance: 'Bradesco Saúde', plan: 'Executivo', gender: 'male', birthDate: '1978-07-22', cep: '30140-000', street: 'Rua da Bahia', number: '500', neighborhood: 'Lourdes', city: 'Belo Horizonte', state: 'MG', email: null },
        { id: pIds[2], name: 'Beatriz Oliveira Santos', phone: '31965432109', insurance: 'Amil', plan: 'S450', gender: 'female', birthDate: '1992-11-08', cep: '30150-000', street: 'Rua Espírito Santo', number: '320', neighborhood: 'Funcionários', city: 'Belo Horizonte', state: 'MG', email: null },
        { id: pIds[3], name: 'Roberto Nascimento Lima', phone: '31954321098', insurance: 'SulAmérica', plan: 'Clássico', gender: 'male', birthDate: '1965-01-30', cep: '30160-000', street: 'Av. Brasil', number: '1200', neighborhood: 'Savassi', city: 'Belo Horizonte', state: 'MG', email: null },
        { id: pIds[4], name: 'Mariana Rodrigues Pinto', phone: '31943210987', insurance: 'Unimed', plan: 'Estadual', gender: 'female', birthDate: '1990-05-19', cep: '30170-000', street: 'Rua Tomé de Souza', number: '45', neighborhood: 'Buritis', city: 'Belo Horizonte', state: 'MG', email: null },
        { id: pIds[5], name: 'José Antonio Pereira', phone: '31932109876', insurance: 'Bradesco Saúde', plan: 'Top', gender: 'male', birthDate: '1955-09-12', cep: '30180-000', street: 'Rua Curitiba', number: '777', neighborhood: 'Cidade Nova', city: 'Belo Horizonte', state: 'MG', email: null },
        { id: pIds[6], name: 'Luciana Carvalho Mendes', phone: '31921098765', insurance: 'Amil', plan: 'S250', gender: 'female', birthDate: '1982-04-25', cep: '30190-000', street: 'Av. Getúlio Vargas', number: '900', neighborhood: 'Floresta', city: 'Belo Horizonte', state: 'MG', email: null },
        { id: pIds[7], name: 'Felipe Augusto Torres', phone: '31910987654', insurance: 'Notre Dame', plan: 'Especial', gender: 'male', birthDate: '1998-12-03', cep: '30200-000', street: 'Rua São Paulo', number: '22', neighborhood: 'Gutierrez', city: 'Belo Horizonte', state: 'MG', email: null },
        { id: pIds[8], name: 'Patrícia Lima Souza', phone: '31909876543', insurance: 'Unimed', plan: 'Nacional', gender: 'female', birthDate: '1975-08-17', cep: '30210-000', street: 'Av. Raja Gabaglia', number: '3200', neighborhood: 'Estoril', city: 'Belo Horizonte', state: 'MG', email: null },
        { id: pIds[9], name: 'Diego Henrique Costa', phone: '31898765432', insurance: 'SulAmérica', plan: 'Especial', gender: 'male', birthDate: '2000-02-14', cep: '30220-000', street: 'Rua Grão Mogol', number: '150', neighborhood: 'Santo Antônio', city: 'Belo Horizonte', state: 'MG', email: null },
        { id: pIds[10], name: 'Sandra Aparecida Gomes', phone: '31887654321', insurance: 'Amil', plan: 'S750', gender: 'female', birthDate: '1969-06-28', cep: '30230-000', street: 'Rua Itambé', number: '88', neighborhood: 'Pampulha', city: 'Belo Horizonte', state: 'MG', email: null },
        { id: pIds[11], name: 'Thiago Moreira Alves', phone: '31876543210', insurance: 'Bradesco Saúde', plan: 'Nacional', gender: 'male', birthDate: '1988-10-05', cep: '30240-000', street: 'Av. Antônio Carlos', number: '6627', neighborhood: 'Pampulha', city: 'Belo Horizonte', state: 'MG', email: null },
    ]
    const stmtPatient = db.prepare(`INSERT INTO "Patient" (id,name,insurance,plan,birthDate,gender,cep,street,number,neighborhood,city,state,phone,email,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    patients.forEach(p => stmtPatient.run(p.id, p.name, p.insurance ?? null, p.plan ?? null, p.birthDate ?? null, p.gender, p.cep ?? null, p.street ?? null, p.number ?? null, p.neighborhood ?? null, p.city ?? null, p.state ?? null, p.phone ?? null, p.email ?? null, now))

    // Consultations
    const stmtConsult = db.prepare(`INSERT INTO "Consultation" (id,patientName,phone,time,date,status,whatsappSent,isArchived,insurance,patientId,doctorId,hospitalId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    const consults = [
        [cuid(), patients[0].name, patients[0].phone, '08:00', today + 'T08:00:00.000Z', 'Confirmado', 1, 0, patients[0].insurance, pIds[0], doctorIds[0], hIds[0]],
        [cuid(), patients[1].name, patients[1].phone, '08:30', today + 'T08:30:00.000Z', 'Aguardando', 1, 0, patients[1].insurance, pIds[1], doctorIds[0], hIds[0]],
        [cuid(), patients[2].name, patients[2].phone, '09:00', today + 'T09:00:00.000Z', 'Pendente', 0, 0, patients[2].insurance, pIds[2], doctorIds[1], hIds[1]],
        [cuid(), patients[3].name, patients[3].phone, '09:30', today + 'T09:30:00.000Z', 'Pendente', 0, 0, patients[3].insurance, pIds[3], doctorIds[1], hIds[1]],
        [cuid(), patients[4].name, patients[4].phone, '10:00', today + 'T10:00:00.000Z', 'Cancelado', 1, 0, patients[4].insurance, pIds[4], doctorIds[2], hIds[2]],
        [cuid(), patients[5].name, patients[5].phone, '10:30', today + 'T10:30:00.000Z', 'Confirmado', 1, 0, patients[5].insurance, pIds[5], doctorIds[2], hIds[2]],
        [cuid(), patients[6].name, patients[6].phone, '11:00', tomorrow + 'T11:00:00.000Z', 'Pendente', 0, 0, patients[6].insurance, pIds[6], doctorIds[3], hIds[0]],
        [cuid(), patients[7].name, patients[7].phone, '11:30', tomorrow + 'T11:30:00.000Z', 'Pendente', 0, 0, patients[7].insurance, pIds[7], doctorIds[3], hIds[0]],
        [cuid(), patients[8].name, patients[8].phone, '14:00', yesterday + 'T14:00:00.000Z', 'Confirmado', 1, 1, patients[8].insurance, pIds[8], doctorIds[4], hIds[1]],
        [cuid(), patients[9].name, patients[9].phone, '14:30', yesterday + 'T14:30:00.000Z', 'Cancelado', 1, 1, patients[9].insurance, pIds[9], doctorIds[4], hIds[1]],
        [cuid(), patients[10].name, patients[10].phone, '15:00', yesterday + 'T15:00:00.000Z', 'Confirmado', 1, 1, patients[10].insurance, pIds[10], doctorIds[0], hIds[2]],
        [cuid(), patients[11].name, patients[11].phone, '15:30', today + 'T15:30:00.000Z', 'Sem Confirmação', 1, 0, patients[11].insurance, pIds[11], doctorIds[1], hIds[2]],
    ]
    consults.forEach(c => stmtConsult.run(...c))

    // Procedures
    const stmtProc = db.prepare(`INSERT INTO "Procedure" (id,code,name,specialty,fastingTime,estimatedDuration,anesthesiaType,equipment,materials,bloodRequirement,teamSize,recoveryTimePACU,recoveryTimeICU,hospitalizationTime,homeRecoveryTime,suggestedCertificateTime,consentForm,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    const procs = [
        [cuid(), 'ORT-001', 'Artroplastia Total do Joelho', 'Ortopedia', '8 horas', '2h30', 'Raqui', 'Sistema de implante de joelho, bisturi elétrico', 'Prótese total de joelho, parafusos', 'Reserva de 2 concentrados de hemácias', '4 profissionais', '2 horas', 'Não necessário', '3 a 5 dias', '4 a 6 semanas', '60 dias', 1],
        [cuid(), 'CAR-001', 'Cateterismo Cardíaco', 'Cardiologia', '6 horas', '1h00', 'Local', 'Fluoroscópio, cateter, stent', 'Kit de cateterismo, contraste iodado', 'Tipagem e reserva', '3 profissionais', '4 horas', 'Conforme avaliação', '1 a 2 dias', '7 dias', '15 dias', 1],
        [cuid(), 'NEU-001', 'Craniotomia Descompressiva', 'Neurologia', '8 horas', '4h00', 'Geral', 'Neuronavegador, drill, aspirador ultrassônico', 'Placa de crânio, parafusos de titânio', 'Reserva de 4 concentrados', '6 profissionais', '4 horas', '2 a 5 dias', '7 a 14 dias', '3 meses', '90 dias', 1],
        [cuid(), 'GIN-001', 'Histerectomia Laparoscópica', 'Ginecologia', '8 horas', '2h00', 'Geral', 'Torre de vídeo laparoscópica, bisturi harmônico', 'Trocartes, suturas absorvíveis', 'Tipagem e reserva', '4 profissionais', '2 horas', 'Não necessário', '2 a 3 dias', '3 semanas', '30 dias', 1],
        [cuid(), 'URO-001', 'Prostatectomia Radical Robótica', 'Urologia', '8 horas', '3h00', 'Geral', 'Sistema robótico da Vinci', 'Trocartes robóticos, clipes hemostáticos', 'Reserva de 2 concentrados', '5 profissionais', '3 horas', 'Não necessário', '2 a 3 dias', '4 semanas', '30 dias', 1],
        [cuid(), 'ORT-002', 'Artroscopia do Ombro', 'Ortopedia', '6 horas', '1h30', 'Geral', 'Torre artroscópica, bisturi elétrico', 'Âncoras para reparo do manguito', 'Não necessário', '3 profissionais', '1 hora', 'Não necessário', 'Ambulatorial', '6 semanas', '45 dias', 1],
        [cuid(), 'CAR-002', 'Ablação por Radiofrequência', 'Cardiologia', '6 horas', '2h00', 'Sedação', 'Sistema de mapeamento tridimensional, gerador de RF', 'Cateteres de ablação', 'Não necessário', '4 profissionais', '2 horas', 'Não necessário', '1 dia', '7 dias', '15 dias', 1],
        [cuid(), 'GEN-001', 'Colecistectomia Laparoscópica', 'Cirurgia Geral', '8 horas', '1h00', 'Geral', 'Torre de vídeo laparoscópica', 'Trocartes, clipes de titânio', 'Não necessário', '3 profissionais', '1 hora', 'Não necessário', '1 a 2 dias', '1 semana', '15 dias', 0],
        [cuid(), 'OFT-001', 'Facoemulsificação com LIO', 'Oftalmologia', '4 horas', '0h30', 'Local', 'Facoemulsificador, microscópio cirúrgico', 'Lente intraocular', 'Não necessário', '2 profissionais', '30 minutos', 'Não necessário', 'Ambulatorial', '1 semana', '7 dias', 1],
        [cuid(), 'PED-001', 'Apendicectomia Laparoscópica', 'Cirurgia Pediátrica', '6 horas', '1h00', 'Geral', 'Torre de vídeo pediátrica', 'Trocartes pediátricos, suturas absorvíveis', 'Tipagem e reserva', '4 profissionais', '2 horas', 'Conforme avaliação', '2 a 3 dias', '1 semana', '15 dias', 1],
    ]
    procs.forEach(p => stmtProc.run(...p, now, now))

    // Surgeries
    const stmtSurg = db.prepare(`INSERT INTO "Surgery" (id,patientId,patientName,doctorId,doctorName,hospitalId,hospitalName,procedure,date,startTime,endTime,room,status,notes,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    const surgs = [
        [cuid(), pIds[0], patients[0].name, doctorIds[0], doctors[0].name, hIds[0], hospitals[0].name, 'Artroplastia Total do Joelho', today, '07:00', '09:30', 'CC-01', 'scheduled', 'Paciente com histórico de hipertensão'],
        [cuid(), pIds[1], patients[1].name, doctorIds[1], doctors[1].name, hIds[1], hospitals[1].name, 'Cateterismo Cardíaco', today, '10:00', '11:00', 'Hemodinâmica-01', 'in_progress', 'Suspeita de estenose coronariana'],
        [cuid(), pIds[2], patients[2].name, doctorIds[3], doctors[3].name, hIds[0], hospitals[0].name, 'Histerectomia Laparoscópica', today, '13:00', '15:00', 'CC-02', 'scheduled', null],
        [cuid(), pIds[3], patients[3].name, doctorIds[2], doctors[2].name, hIds[2], hospitals[2].name, 'Craniotomia Descompressiva', yesterday, '08:00', '12:00', 'CC-03', 'completed', 'Cirurgia de emergência - TCE grave'],
        [cuid(), pIds[4], patients[4].name, doctorIds[4], doctors[4].name, hIds[1], hospitals[1].name, 'Prostatectomia Radical Robótica', yesterday, '07:30', '10:30', 'CC-Robótica', 'completed', null],
        [cuid(), pIds[5], patients[5].name, doctorIds[0], doctors[0].name, hIds[0], hospitals[0].name, 'Artroscopia do Ombro', tomorrow, '08:00', '09:30', 'CC-01', 'scheduled', null],
        [cuid(), pIds[6], patients[6].name, doctorIds[1], doctors[1].name, hIds[1], hospitals[1].name, 'Ablação por Radiofrequência', tomorrow, '11:00', '13:00', 'Hemodinâmica-02', 'scheduled', null],
        [cuid(), pIds[7], patients[7].name, doctorIds[2], doctors[2].name, hIds[2], hospitals[2].name, 'Colecistectomia Laparoscópica', yesterday, '14:00', '15:00', 'CC-04', 'cancelled', 'Cancelado por infecção ativa'],
        [cuid(), pIds[8], patients[8].name, doctorIds[3], doctors[3].name, hIds[0], hospitals[0].name, 'Facoemulsificação com LIO', tomorrow, '07:00', '07:30', 'CC-Oftalmo', 'scheduled', null],
        [cuid(), pIds[9], patients[9].name, doctorIds[4], doctors[4].name, hIds[1], hospitals[1].name, 'Apendicectomia Laparoscópica', today, '15:00', '16:00', 'CC-05', 'scheduled', null],
    ]
    surgs.forEach(s => stmtSurg.run(...s, now))

    // Admin user (senha: preview123)
    const HASH = '$2b$10$MitLM5mDyxUJH07rM91EtOLD3yQBE9SVOo5yCKNj/21xfOwSD8SlW'
    db.prepare(`INSERT OR IGNORE INTO "User" (id,email,name,passwordHash,role,mustChangePassword,createdAt) VALUES (?,?,?,?,?,?,?)`).run(cuid(), 'admin@preview.local', 'Admin Preview', HASH, 'admin', 0, now)

    console.log('[Preview DB] ✅ Banco in-memory criado com dados de demonstração.')
    console.log('[Preview DB]    → 5 médicos | 3 hospitais | 12 pacientes | 12 consultas | 10 procedimentos | 10 cirurgias')
    console.log('[Preview DB]    → Login: admin@preview.local / preview123')
}

// ─── Inicialização ────────────────────────────────────────────────────────────
function initPreviewDb(): InstanceType<typeof Database> {
    const exists = fs.existsSync(PREVIEW_DB_PATH)
    const db = new Database(PREVIEW_DB_PATH)
    if (!exists) {
        createSchema(db)
        seedDb(db)
    } else {
        // Garantir que as tabelas existem se o arquivo foi parcialmente criado
        createSchema(db)
    }
    return db
}

// Singleton global do better-sqlite3
declare global {
    // eslint-disable-next-line no-var
    var __previewDb: InstanceType<typeof Database> | undefined
}

if (!global.__previewDb) {
    global.__previewDb = initPreviewDb()
}

const previewDb: InstanceType<typeof Database> = global.__previewDb

// ─── Helpers internos ─────────────────────────────────────────────────────────
function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {}
    for (const key of Object.keys(obj)) {
        const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
        result[camel] = obj[key]
    }
    return result
}

function boolFields(obj: Record<string, unknown>, fields: string[]): Record<string, unknown> {
    for (const f of fields) {
        if (f in obj) obj[f] = obj[f] === 1 || obj[f] === true
    }
    return obj
}

const DATE_FIELDS = new Set(['createdAt', 'updatedAt', 'date', 'created_at', 'updated_at', 'birthDate', 'birth_date'])

function mapRow(row: Record<string, unknown>, bools: string[] = []): Record<string, unknown> {
    const camelized = snakeToCamel(row)
    for (const key of Object.keys(camelized)) {
        if (DATE_FIELDS.has(key) && typeof camelized[key] === 'string') {
            const val = camelized[key] as string
            // Se for data/ISO string, converter para Date
            if (val && (val.includes('T') || val.includes('-'))) {
                const parsed = new Date(val)
                if (!isNaN(parsed.getTime())) {
                    camelized[key] = parsed
                }
            }
        }
    }
    return boolFields(camelized, bools)
}

function applyWhere(query: string, where?: Record<string, unknown>): { sql: string; params: unknown[] } {
    if (!where || Object.keys(where).length === 0) return { sql: query, params: [] }
    const conditions: string[] = []
    const params: unknown[] = []

    for (const [k, v] of Object.entries(where)) {
        if (k === 'OR' && Array.isArray(v)) {
            const orConditions: string[] = []
            for (const item of v) {
                if (typeof item === 'object' && item !== null) {
                    const subParts: string[] = []
                    for (const [subK, subV] of Object.entries(item as Record<string, unknown>)) {
                        if (subV !== undefined && subV !== null) {
                            subParts.push(`"${subK}" = ?`)
                            params.push(subV)
                        }
                    }
                    if (subParts.length > 0) {
                        orConditions.push(`(${subParts.join(' AND ')})`)
                    }
                }
            }
            if (orConditions.length > 0) {
                conditions.push(`(${orConditions.join(' OR ')})`)
            }
        } else if (v !== undefined && v !== null) {
            conditions.push(`"${k}" = ?`)
            params.push(v)
        }
    }
    if (conditions.length === 0) return { sql: query, params: [] }
    return { sql: `${query} WHERE ${conditions.join(' AND ')}`, params }
}

// ─── Interface compatível com Prisma Client ───────────────────────────────────
// Cada model expõe: findMany, findFirst, findUnique, create, update, delete, deleteMany, count

type WhereClause = Record<string, unknown>
type OrderBy = Record<string, 'asc' | 'desc'>

interface FindManyArgs {
    where?: WhereClause
    orderBy?: OrderBy | OrderBy[]
    include?: Record<string, boolean>
    take?: number
    skip?: number
}

interface FindUniqueArgs { where: WhereClause; select?: Record<string, boolean>; include?: Record<string, boolean> }
interface CreateArgs { data: Record<string, unknown>; include?: Record<string, boolean> }
interface UpdateArgs { where: WhereClause; data: Record<string, unknown>; include?: Record<string, boolean> }
interface DeleteArgs { where: WhereClause }
interface DeleteManyArgs { where?: WhereClause }
interface CountArgs { where?: WhereClause }

function makeModel(
    table: string,
    bools: string[] = [],
    includeMap: Record<string, { table: string; fk: string; pk?: string; multi?: boolean }> = {}
) {
    function resolveIncludes(row: Record<string, unknown>, include?: Record<string, boolean>): Record<string, unknown> {
        if (!include) return row
        for (const [key, doInclude] of Object.entries(include)) {
            if (!doInclude || !includeMap[key]) continue
            const { table: t, fk, pk = 'id', multi = false } = includeMap[key]
            const fkVal = row[fk]
            if (!fkVal && !multi) { row[key] = null; continue }
            if (multi) {
                const rows = previewDb.prepare(`SELECT * FROM "${t}" WHERE "${fk}" = ?`).all(row['id']) as Record<string, unknown>[]
                row[key] = rows.map(r => mapRow(r))
            } else {
                const rel = previewDb.prepare(`SELECT * FROM "${t}" WHERE "${pk}" = ?`).get(fkVal) as Record<string, unknown> | undefined
                row[key] = rel ? mapRow(rel) : null
            }
        }
        return row
    }

    function buildOrderBy(orderBy?: OrderBy | OrderBy[]): string {
        if (!orderBy) return ''
        const arr = Array.isArray(orderBy) ? orderBy : [orderBy]
        const parts = arr.flatMap(o => Object.entries(o).map(([k, v]) => `"${k}" ${v.toUpperCase()}`))
        return parts.length ? ` ORDER BY ${parts.join(', ')}` : ''
    }

    return {
        findMany(args: FindManyArgs = {}): Record<string, unknown>[] {
            const { where, orderBy, include, take, skip } = args
            let sql = `SELECT * FROM "${table}"`
            const { sql: withWhere, params } = applyWhere(sql, where)
            sql = withWhere + buildOrderBy(orderBy)
            if (take !== undefined) sql += ` LIMIT ${take}`
            if (skip !== undefined) sql += ` OFFSET ${skip}`
            const rows = previewDb.prepare(sql).all(...params) as Record<string, unknown>[]
            return rows.map(r => resolveIncludes(mapRow(r), include))
        },

        findFirst(args: FindManyArgs = {}): Record<string, unknown> | null {
            const results = this.findMany({ ...args, take: 1 })
            return results[0] ?? null
        },

        findUnique(args: FindUniqueArgs): Record<string, unknown> | null {
            const { sql, params } = applyWhere(`SELECT * FROM "${table}"`, args.where)
            const row = previewDb.prepare(sql + ' LIMIT 1').get(...params) as Record<string, unknown> | undefined
            if (!row) return null
            const mapped = mapRow(row)
            const selectFields: Record<string, boolean> | undefined = args.select
            const selected = selectFields
                ? Object.fromEntries(Object.entries(mapped).filter(([k]) => selectFields[k]))
                : mapped
            return resolveIncludes(selected, args.include)
        },

        create(args: CreateArgs): Record<string, unknown> {
            const id = args.data.id as string || cuid()
            const rawData: Record<string, unknown> = { id, ...args.data }

            // Filter out undefined and convert non-primitive types (Date -> string, boolean -> 0/1)
            const cleanEntries = Object.entries(rawData)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => {
                    let val = v
                    if (val instanceof Date) val = val.toISOString()
                    else if (typeof val === 'boolean') val = val ? 1 : 0
                    return [k, val]
                })

            const keys = cleanEntries.map(([k]) => k)
            const values = cleanEntries.map(([_, v]) => v)
            const placeholders = keys.map(() => '?').join(', ')
            const cols = keys.map(k => `"${k}"`).join(', ')

            previewDb.prepare(`INSERT INTO "${table}" (${cols}) VALUES (${placeholders})`).run(...values)
            const created = previewDb.prepare(`SELECT * FROM "${table}" WHERE id = ?`).get(id) as Record<string, unknown>
            return resolveIncludes(mapRow(created), args.include)
        },

        update(args: UpdateArgs): Record<string, unknown> {
            const cleanEntries = Object.entries(args.data)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => {
                    let val = v
                    if (val instanceof Date) val = val.toISOString()
                    else if (typeof val === 'boolean') val = val ? 1 : 0
                    return [k, val]
                })

            if (cleanEntries.length > 0) {
                const sets = cleanEntries.map(([k]) => `"${k}" = ?`).join(', ')
                const setValues = cleanEntries.map(([_, v]) => v)
                const { sql: whereSql, params: whereParams } = applyWhere('', args.where)
                previewDb.prepare(`UPDATE "${table}" SET ${sets}${whereSql}`).run(...setValues, ...whereParams)
            }

            const row = this.findFirst({ where: args.where })
            return resolveIncludes(row!, args.include)
        },

        delete(args: DeleteArgs): Record<string, unknown> {
            const existing = this.findFirst({ where: args.where })
            const { sql: whereSql, params } = applyWhere('', args.where)
            previewDb.prepare(`DELETE FROM "${table}"${whereSql}`).run(...params)
            return existing!
        },

        deleteMany(args: DeleteManyArgs = {}): { count: number } {
            const { sql: whereSql, params } = applyWhere('', args.where)
            const result = previewDb.prepare(`DELETE FROM "${table}"${whereSql}`).run(...params)
            return { count: result.changes }
        },

        count(args: CountArgs = {}): number {
            const { sql: whereSql, params } = applyWhere(`SELECT COUNT(*) as n FROM "${table}"`, args.where)
            const row = previewDb.prepare(whereSql).get(...params) as { n: number }
            return row.n
        },
    }
}

// ─── Proxy Prisma-compatible ──────────────────────────────────────────────────
const prismaPreview = {
    doctor: makeModel('Doctor', ['status'], { consultations: { table: 'Consultation', fk: 'doctorId', multi: true } }),
    hospital: makeModel('Hospital', [], {
        contacts: { table: 'HospitalContact', fk: 'hospitalId', multi: true },
        consultations: { table: 'Consultation', fk: 'hospitalId', multi: true },
    }),
    hospitalContact: makeModel('HospitalContact'),
    patient: makeModel('Patient', [], { consultations: { table: 'Consultation', fk: 'patientId', multi: true } }),
    consultation: makeModel('Consultation', ['whatsappSent', 'isArchived'], {
        doctor: { table: 'Doctor', fk: 'doctorId' },
        hospital: { table: 'Hospital', fk: 'hospitalId' },
        patient: { table: 'Patient', fk: 'patientId' },
    }),
    surgery: makeModel('Surgery', [], { comments: { table: 'Comment', fk: 'surgeryId', multi: true } }),
    comment: makeModel('Comment', [], { surgery: { table: 'Surgery', fk: 'surgeryId' } }),
    procedure: makeModel('Procedure', ['consentForm'], { reports: { table: 'ProcedureReport', fk: 'procedureId', multi: true } }),
    procedureReport: makeModel('ProcedureReport'),
    user: makeModel('User', ['mustChangePassword']),
    appointment: makeModel('appointments', ['fromWebsite', 'whatsappSent']),

    $disconnect: async () => { /* no-op para compatibilidade */ },
}

export default prismaPreview
