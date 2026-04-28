import prisma from '../lib/prisma'

async function main() {
    console.log('🌱 Iniciando seed...')

    // ── Doctors ──────────────────────────────────────────────────────────────
    const doctors = await Promise.all([
        prisma.doctor.create({ data: { crm: 'MG-12345', name: 'Dr. Ricardo Almeida', specialty: 'Ortopedia', status: 'active' } }),
        prisma.doctor.create({ data: { crm: 'MG-23456', name: 'Dra. Fernanda Costa', specialty: 'Cardiologia', status: 'active' } }),
        prisma.doctor.create({ data: { crm: 'MG-34567', name: 'Dr. Marcos Souza', specialty: 'Neurologia', status: 'active' } }),
        prisma.doctor.create({ data: { crm: 'MG-45678', name: 'Dra. Juliana Martins', specialty: 'Ginecologia', status: 'active' } }),
        prisma.doctor.create({ data: { crm: 'MG-56789', name: 'Dr. Paulo Henrique Rocha', specialty: 'Urologia', status: 'active' } }),
    ])

    // ── Hospitals ─────────────────────────────────────────────────────────────
    const h1 = await prisma.hospital.create({
        data: {
            name: 'Hospital Santa Casa de Misericórdia',
            cep: '30150-221',
            street: 'Rua Domingos Vieira',
            number: '590',
            neighborhood: 'Santa Efigênia',
            city: 'Belo Horizonte',
            state: 'MG',
            contacts: {
                create: [
                    { type: 'phone', value: '(31) 3238-8000', label: 'Central', isPrimary: true },
                    { type: 'email', value: 'contato@santacasa.org.br', label: 'Geral', isPrimary: true },
                ],
            },
        },
    })

    const h2 = await prisma.hospital.create({
        data: {
            name: 'Hospital Mater Dei',
            cep: '30315-901',
            street: 'Rua Gonçalves Dias',
            number: '2700',
            neighborhood: 'Santo Agostinho',
            city: 'Belo Horizonte',
            state: 'MG',
            contacts: {
                create: [
                    { type: 'phone', value: '(31) 3339-9000', label: 'Agendamento', isPrimary: true },
                    { type: 'email', value: 'agendamento@materdei.com.br', label: 'Agendamento', isPrimary: true },
                ],
            },
        },
    })

    const h3 = await prisma.hospital.create({
        data: {
            name: 'Hospital Lifecenter',
            cep: '30310-909',
            street: 'Rua Alameda Ezequiel Dias',
            number: '345',
            neighborhood: 'Centro',
            city: 'Belo Horizonte',
            state: 'MG',
            contacts: {
                create: [
                    { type: 'phone', value: '(31) 3516-9000', label: 'Recepção', isPrimary: true },
                ],
            },
        },
    })

    // ── Patients ──────────────────────────────────────────────────────────────
    const patients = await Promise.all([
        prisma.patient.create({ data: { name: 'Ana Paula Silva', phone: '31987654321', insurance: 'Unimed', plan: 'Nacional', gender: 'female', birthDate: '1985-03-15', cep: '30130-000', street: 'Av. Afonso Pena', number: '100', neighborhood: 'Centro', city: 'Belo Horizonte', state: 'MG', email: 'ana.silva@email.com' } }),
        prisma.patient.create({ data: { name: 'Carlos Eduardo Ferreira', phone: '31976543210', insurance: 'Bradesco Saúde', plan: 'Executivo', gender: 'male', birthDate: '1978-07-22', cep: '30140-000', street: 'Rua da Bahia', number: '500', neighborhood: 'Lourdes', city: 'Belo Horizonte', state: 'MG' } }),
        prisma.patient.create({ data: { name: 'Beatriz Oliveira Santos', phone: '31965432109', insurance: 'Amil', plan: 'S450', gender: 'female', birthDate: '1992-11-08', cep: '30150-000', street: 'Rua Espírito Santo', number: '320', neighborhood: 'Funcionários', city: 'Belo Horizonte', state: 'MG' } }),
        prisma.patient.create({ data: { name: 'Roberto Nascimento Lima', phone: '31954321098', insurance: 'SulAmérica', plan: 'Clássico', gender: 'male', birthDate: '1965-01-30', cep: '30160-000', street: 'Av. Brasil', number: '1200', neighborhood: 'Savassi', city: 'Belo Horizonte', state: 'MG' } }),
        prisma.patient.create({ data: { name: 'Mariana Rodrigues Pinto', phone: '31943210987', insurance: 'Unimed', plan: 'Estadual', gender: 'female', birthDate: '1990-05-19', cep: '30170-000', street: 'Rua Tomé de Souza', number: '45', neighborhood: 'Buritis', city: 'Belo Horizonte', state: 'MG' } }),
        prisma.patient.create({ data: { name: 'José Antonio Pereira', phone: '31932109876', insurance: 'Bradesco Saúde', plan: 'Top', gender: 'male', birthDate: '1955-09-12', cep: '30180-000', street: 'Rua Curitiba', number: '777', neighborhood: 'Cidade Nova', city: 'Belo Horizonte', state: 'MG' } }),
        prisma.patient.create({ data: { name: 'Luciana Carvalho Mendes', phone: '31921098765', insurance: 'Amil', plan: 'S250', gender: 'female', birthDate: '1982-04-25', cep: '30190-000', street: 'Av. Getúlio Vargas', number: '900', neighborhood: 'Floresta', city: 'Belo Horizonte', state: 'MG' } }),
        prisma.patient.create({ data: { name: 'Felipe Augusto Torres', phone: '31910987654', insurance: 'Notre Dame', plan: 'Especial', gender: 'male', birthDate: '1998-12-03', cep: '30200-000', street: 'Rua São Paulo', number: '22', neighborhood: 'Gutierrez', city: 'Belo Horizonte', state: 'MG' } }),
        prisma.patient.create({ data: { name: 'Patrícia Lima Souza', phone: '31909876543', insurance: 'Unimed', plan: 'Nacional', gender: 'female', birthDate: '1975-08-17', cep: '30210-000', street: 'Av. Raja Gabaglia', number: '3200', neighborhood: 'Estoril', city: 'Belo Horizonte', state: 'MG' } }),
        prisma.patient.create({ data: { name: 'Diego Henrique Costa', phone: '31898765432', insurance: 'SulAmérica', plan: 'Especial', gender: 'male', birthDate: '2000-02-14', cep: '30220-000', street: 'Rua Grão Mogol', number: '150', neighborhood: 'Santo Antônio', city: 'Belo Horizonte', state: 'MG' } }),
        prisma.patient.create({ data: { name: 'Sandra Aparecida Gomes', phone: '31887654321', insurance: 'Amil', plan: 'S750', gender: 'female', birthDate: '1969-06-28', cep: '30230-000', street: 'Rua Itambé', number: '88', neighborhood: 'Pampulha', city: 'Belo Horizonte', state: 'MG' } }),
        prisma.patient.create({ data: { name: 'Thiago Moreira Alves', phone: '31876543210', insurance: 'Bradesco Saúde', plan: 'Nacional', gender: 'male', birthDate: '1988-10-05', cep: '30240-000', street: 'Av. Antônio Carlos', number: '6627', neighborhood: 'Pampulha', city: 'Belo Horizonte', state: 'MG' } }),
    ])

    // ── Consultations ──────────────────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

    await Promise.all([
        prisma.consultation.create({ data: { patientName: patients[0].name, phone: patients[0].phone, time: '08:00', date: new Date(today), status: 'Confirmado', whatsappSent: true, doctorId: doctors[0].id, hospitalId: h1.id, insurance: patients[0].insurance, patientId: patients[0].id } }),
        prisma.consultation.create({ data: { patientName: patients[1].name, phone: patients[1].phone, time: '08:30', date: new Date(today), status: 'Aguardando', whatsappSent: true, doctorId: doctors[0].id, hospitalId: h1.id, insurance: patients[1].insurance, patientId: patients[1].id } }),
        prisma.consultation.create({ data: { patientName: patients[2].name, phone: patients[2].phone, time: '09:00', date: new Date(today), status: 'Pendente', whatsappSent: false, doctorId: doctors[1].id, hospitalId: h2.id, insurance: patients[2].insurance, patientId: patients[2].id } }),
        prisma.consultation.create({ data: { patientName: patients[3].name, phone: patients[3].phone, time: '09:30', date: new Date(today), status: 'Pendente', whatsappSent: false, doctorId: doctors[1].id, hospitalId: h2.id, insurance: patients[3].insurance, patientId: patients[3].id } }),
        prisma.consultation.create({ data: { patientName: patients[4].name, phone: patients[4].phone, time: '10:00', date: new Date(today), status: 'Cancelado', whatsappSent: true, doctorId: doctors[2].id, hospitalId: h3.id, insurance: patients[4].insurance, patientId: patients[4].id } }),
        prisma.consultation.create({ data: { patientName: patients[5].name, phone: patients[5].phone, time: '10:30', date: new Date(today), status: 'Confirmado', whatsappSent: true, doctorId: doctors[2].id, hospitalId: h3.id, insurance: patients[5].insurance, patientId: patients[5].id } }),
        prisma.consultation.create({ data: { patientName: patients[6].name, phone: patients[6].phone, time: '11:00', date: new Date(tomorrow), status: 'Pendente', whatsappSent: false, doctorId: doctors[3].id, hospitalId: h1.id, insurance: patients[6].insurance, patientId: patients[6].id } }),
        prisma.consultation.create({ data: { patientName: patients[7].name, phone: patients[7].phone, time: '11:30', date: new Date(tomorrow), status: 'Pendente', whatsappSent: false, doctorId: doctors[3].id, hospitalId: h1.id, insurance: patients[7].insurance, patientId: patients[7].id } }),
        prisma.consultation.create({ data: { patientName: patients[8].name, phone: patients[8].phone, time: '14:00', date: new Date(yesterday), status: 'Confirmado', whatsappSent: true, isArchived: true, doctorId: doctors[4].id, hospitalId: h2.id, insurance: patients[8].insurance, patientId: patients[8].id, observations: 'Paciente chegou no horário' } }),
        prisma.consultation.create({ data: { patientName: patients[9].name, phone: patients[9].phone, time: '14:30', date: new Date(yesterday), status: 'Cancelado', whatsappSent: true, isArchived: true, doctorId: doctors[4].id, hospitalId: h2.id, insurance: patients[9].insurance, patientId: patients[9].id } }),
        prisma.consultation.create({ data: { patientName: patients[10].name, phone: patients[10].phone, time: '15:00', date: new Date(yesterday), status: 'Confirmado', whatsappSent: true, isArchived: true, doctorId: doctors[0].id, hospitalId: h3.id, insurance: patients[10].insurance, patientId: patients[10].id } }),
        prisma.consultation.create({ data: { patientName: patients[11].name, phone: patients[11].phone, time: '15:30', date: new Date(today), status: 'Sem Confirmação', whatsappSent: true, doctorId: doctors[1].id, hospitalId: h3.id, insurance: patients[11].insurance, patientId: patients[11].id } }),
    ])

    // ── Procedures ────────────────────────────────────────────────────────────
    await Promise.all([
        prisma.procedure.create({ data: { code: 'ORT-001', name: 'Artroplastia Total do Joelho', specialty: 'Ortopedia', fastingTime: '8 horas', estimatedDuration: '2h30', anesthesiaType: 'Raqui', equipment: 'Sistema de implante de joelho, bisturi elétrico', materials: 'Prótese total de joelho, parafusos', bloodRequirement: 'Reserva de 2 concentrados de hemácias', teamSize: '4 profissionais', recoveryTimePACU: '2 horas', recoveryTimeICU: 'Não necessário', hospitalizationTime: '3 a 5 dias', homeRecoveryTime: '4 a 6 semanas', suggestedCertificateTime: '60 dias', consentForm: true } }),
        prisma.procedure.create({ data: { code: 'CAR-001', name: 'Cateterismo Cardíaco', specialty: 'Cardiologia', fastingTime: '6 horas', estimatedDuration: '1h00', anesthesiaType: 'Local', equipment: 'Fluoroscópio, cateter, stent', materials: 'Kit de cateterismo, contraste iodado', bloodRequirement: 'Tipagem e reserva', teamSize: '3 profissionais', recoveryTimePACU: '4 horas', recoveryTimeICU: 'Conforme avaliação', hospitalizationTime: '1 a 2 dias', homeRecoveryTime: '7 dias', suggestedCertificateTime: '15 dias', consentForm: true } }),
        prisma.procedure.create({ data: { code: 'NEU-001', name: 'Craniotomia Descompressiva', specialty: 'Neurologia', fastingTime: '8 horas', estimatedDuration: '4h00', anesthesiaType: 'Geral', equipment: 'Neuronavegador, drill, aspirador ultrassônico', materials: 'Placa de crânio, parafusos de titânio', bloodRequirement: 'Reserva de 4 concentrados', teamSize: '6 profissionais', recoveryTimePACU: '4 horas', recoveryTimeICU: '2 a 5 dias', hospitalizationTime: '7 a 14 dias', homeRecoveryTime: '3 meses', suggestedCertificateTime: '90 dias', consentForm: true } }),
        prisma.procedure.create({ data: { code: 'GIN-001', name: 'Histerectomia Laparoscópica', specialty: 'Ginecologia', fastingTime: '8 horas', estimatedDuration: '2h00', anesthesiaType: 'Geral', equipment: 'Torre de vídeo laparoscópica, bisturi harmônico', materials: 'Trocartes, suturas absorvíveis', bloodRequirement: 'Tipagem e reserva', teamSize: '4 profissionais', recoveryTimePACU: '2 horas', recoveryTimeICU: 'Não necessário', hospitalizationTime: '2 a 3 dias', homeRecoveryTime: '3 semanas', suggestedCertificateTime: '30 dias', consentForm: true } }),
        prisma.procedure.create({ data: { code: 'URO-001', name: 'Prostatectomia Radical Robótica', specialty: 'Urologia', fastingTime: '8 horas', estimatedDuration: '3h00', anesthesiaType: 'Geral', equipment: 'Sistema robótico da Vinci', materials: 'Trocartes robóticos, clipes hemostáticos', bloodRequirement: 'Reserva de 2 concentrados', teamSize: '5 profissionais', recoveryTimePACU: '3 horas', recoveryTimeICU: 'Não necessário', hospitalizationTime: '2 a 3 dias', homeRecoveryTime: '4 semanas', suggestedCertificateTime: '30 dias', consentForm: true } }),
        prisma.procedure.create({ data: { code: 'ORT-002', name: 'Artroscopia do Ombro', specialty: 'Ortopedia', fastingTime: '6 horas', estimatedDuration: '1h30', anesthesiaType: 'Geral', equipment: 'Torre artroscópica, bisturi elétrico', materials: 'Âncoras para reparo do manguito', bloodRequirement: 'Não necessário', teamSize: '3 profissionais', recoveryTimePACU: '1 hora', recoveryTimeICU: 'Não necessário', hospitalizationTime: 'Ambulatorial', homeRecoveryTime: '6 semanas', suggestedCertificateTime: '45 dias', consentForm: true } }),
        prisma.procedure.create({ data: { code: 'CAR-002', name: 'Ablação por Radiofrequência', specialty: 'Cardiologia', fastingTime: '6 horas', estimatedDuration: '2h00', anesthesiaType: 'Sedação', equipment: 'Sistema de mapeamento tridimensional, gerador de RF', materials: 'Cateteres de ablação', bloodRequirement: 'Não necessário', teamSize: '4 profissionais', recoveryTimePACU: '2 horas', recoveryTimeICU: 'Não necessário', hospitalizationTime: '1 dia', homeRecoveryTime: '7 dias', suggestedCertificateTime: '15 dias', consentForm: true } }),
        prisma.procedure.create({ data: { code: 'GEN-001', name: 'Colecistectomia Laparoscópica', specialty: 'Cirurgia Geral', fastingTime: '8 horas', estimatedDuration: '1h00', anesthesiaType: 'Geral', equipment: 'Torre de vídeo laparoscópica', materials: 'Trocartes, clipes de titânio', bloodRequirement: 'Não necessário', teamSize: '3 profissionais', recoveryTimePACU: '1 hora', recoveryTimeICU: 'Não necessário', hospitalizationTime: '1 a 2 dias', homeRecoveryTime: '1 semana', suggestedCertificateTime: '15 dias', consentForm: false } }),
        prisma.procedure.create({ data: { code: 'OFT-001', name: 'Facoemulsificação com LIO', specialty: 'Oftalmologia', fastingTime: '4 horas', estimatedDuration: '0h30', anesthesiaType: 'Local', equipment: 'Facoemulsificador, microscópio cirúrgico', materials: 'Lente intraocular', bloodRequirement: 'Não necessário', teamSize: '2 profissionais', recoveryTimePACU: '30 minutos', recoveryTimeICU: 'Não necessário', hospitalizationTime: 'Ambulatorial', homeRecoveryTime: '1 semana', suggestedCertificateTime: '7 dias', consentForm: true } }),
        prisma.procedure.create({ data: { code: 'PED-001', name: 'Apendicectomia Laparoscópica', specialty: 'Cirurgia Pediátrica', fastingTime: '6 horas', estimatedDuration: '1h00', anesthesiaType: 'Geral', equipment: 'Torre de vídeo pediátrica', materials: 'Trocartes pediátricos, suturas absorvíveis', bloodRequirement: 'Tipagem e reserva', teamSize: '4 profissionais', recoveryTimePACU: '2 horas', recoveryTimeICU: 'Conforme avaliação', hospitalizationTime: '2 a 3 dias', homeRecoveryTime: '1 semana', suggestedCertificateTime: '15 dias', consentForm: true } }),
    ])

    // ── Surgeries ─────────────────────────────────────────────────────────────
    await Promise.all([
        prisma.surgery.create({ data: { patientId: patients[0].id, patientName: patients[0].name, doctorId: doctors[0].id, doctorName: doctors[0].name, hospitalId: h1.id, hospitalName: h1.name, procedure: 'Artroplastia Total do Joelho', date: today, startTime: '07:00', endTime: '09:30', room: 'CC-01', status: 'scheduled', notes: 'Paciente com histórico de hipertensão' } }),
        prisma.surgery.create({ data: { patientId: patients[1].id, patientName: patients[1].name, doctorId: doctors[1].id, doctorName: doctors[1].name, hospitalId: h2.id, hospitalName: h2.name, procedure: 'Cateterismo Cardíaco', date: today, startTime: '10:00', endTime: '11:00', room: 'Hemodinâmica-01', status: 'in_progress', notes: 'Suspeita de estenose coronariana' } }),
        prisma.surgery.create({ data: { patientId: patients[2].id, patientName: patients[2].name, doctorId: doctors[3].id, doctorName: doctors[3].name, hospitalId: h1.id, hospitalName: h1.name, procedure: 'Histerectomia Laparoscópica', date: today, startTime: '13:00', endTime: '15:00', room: 'CC-02', status: 'scheduled' } }),
        prisma.surgery.create({ data: { patientId: patients[3].id, patientName: patients[3].name, doctorId: doctors[2].id, doctorName: doctors[2].name, hospitalId: h3.id, hospitalName: h3.name, procedure: 'Craniotomia Descompressiva', date: yesterday, startTime: '08:00', endTime: '12:00', room: 'CC-03', status: 'completed', notes: 'Cirurgia de emergência - TCE grave' } }),
        prisma.surgery.create({ data: { patientId: patients[4].id, patientName: patients[4].name, doctorId: doctors[4].id, doctorName: doctors[4].name, hospitalId: h2.id, hospitalName: h2.name, procedure: 'Prostatectomia Radical Robótica', date: yesterday, startTime: '07:30', endTime: '10:30', room: 'CC-Robótica', status: 'completed' } }),
        prisma.surgery.create({ data: { patientId: patients[5].id, patientName: patients[5].name, doctorId: doctors[0].id, doctorName: doctors[0].name, hospitalId: h1.id, hospitalName: h1.name, procedure: 'Artroscopia do Ombro', date: tomorrow, startTime: '08:00', endTime: '09:30', room: 'CC-01', status: 'scheduled' } }),
        prisma.surgery.create({ data: { patientId: patients[6].id, patientName: patients[6].name, doctorId: doctors[1].id, doctorName: doctors[1].name, hospitalId: h2.id, hospitalName: h2.name, procedure: 'Ablação por Radiofrequência', date: tomorrow, startTime: '11:00', endTime: '13:00', room: 'Hemodinâmica-02', status: 'scheduled' } }),
        prisma.surgery.create({ data: { patientId: patients[7].id, patientName: patients[7].name, doctorId: doctors[2].id, doctorName: doctors[2].name, hospitalId: h3.id, hospitalName: h3.name, procedure: 'Colecistectomia Laparoscópica', date: yesterday, startTime: '14:00', endTime: '15:00', room: 'CC-04', status: 'cancelled', notes: 'Cancelado por infecção ativa' } }),
        prisma.surgery.create({ data: { patientId: patients[8].id, patientName: patients[8].name, doctorId: doctors[3].id, doctorName: doctors[3].name, hospitalId: h1.id, hospitalName: h1.name, procedure: 'Facoemulsificação com LIO', date: tomorrow, startTime: '07:00', endTime: '07:30', room: 'CC-Oftalmo', status: 'scheduled' } }),
        prisma.surgery.create({ data: { patientId: patients[9].id, patientName: patients[9].name, doctorId: doctors[4].id, doctorName: doctors[4].name, hospitalId: h2.id, hospitalName: h2.name, procedure: 'Apendicectomia Laparoscópica', date: today, startTime: '15:00', endTime: '16:00', room: 'CC-05', status: 'scheduled' } }),
    ])

    console.log('✅ Seed concluído com sucesso!')
    console.log(`   → ${doctors.length} médicos`)
    console.log('   → 3 hospitais com contatos')
    console.log(`   → ${patients.length} pacientes`)
    console.log('   → 12 consultas (hoje, ontem e amanhã)')
    console.log('   → 10 procedimentos')
    console.log('   → 10 cirurgias')
}

main()
    .catch((e) => {
        console.error('❌ Erro no seed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
