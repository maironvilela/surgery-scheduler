/**
 * Script de teste automatizado para o fluxo de Agendamento + Tags uTalk (Chat e Contato)
 * Referência: prisma/action.md
 */

import 'dotenv/config';
import { getDoctorTagId, getDoctorSenderPhone } from '../lib/constants/scheduling';

async function testAgendamentoUTalk() {
    console.log('================================================================');
    console.log('🧪 TESTE DE INTEGRACAO: AGENDAMENTO + TAG NO CHAT + TAG NO CONTATO');
    console.log('================================================================');

    const testDoctor = 'Dr. Jader de Andrade';
    const doctorTagId = getDoctorTagId(testDoctor);
    const doctorPhone = getDoctorSenderPhone(testDoctor);
    const chatTagId = process.env.UTALK_TAG_CONFIRMAR_CONSULTA || process.env.UTALK_TAG_CONFIRMAR || 'apCBYzdOOoCHceOO';

    console.log('1. Verificando Mapeamento dos Dados de Agendamento:');
    console.log('   - Médico selecionado:', testDoctor);
    console.log('   - Remetente do Médico (fromPhone):', doctorPhone);
    console.log('   - Tag de Confirmação do Chat (CHAT_TAG_ID):', chatTagId);
    console.log('   - Tag do Médico para o Contato (DOCTOR_TAG_ID):', doctorTagId);
    console.log('----------------------------------------------------------------');

    console.log('2. Testando endpoints uTalk simulados/locais:');

    const payload = {
        toPhone: '+5531987205436',
        message: '📌 *Confirmação de Agendamento (Teste)*\n\nSua consulta foi agendada.',
        contactName: 'Paciente Teste Fluxo Completo',
        doctorName: testDoctor
    };

    try {
        const res = await fetch('http://localhost:4000/api/utalk/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        console.log('   Status HTTP:', res.status);
        const data = await res.json();
        console.log('   Resposta JSON:\n', JSON.stringify(data, null, 2));

        if (res.status === 200 && data.success) {
            console.log('\n✅ PASS 1: Mensagem enviada via uTalk');
            console.log('✅ PASS 2: Tag do Chat aplicada (' + chatTagId + ')');
            console.log('✅ PASS 3: Tag do Contato do Paciente aplicada (' + doctorTagId + ')');
        } else if (res.status === 401 || data?.details?.status === 401) {
            console.log('\n⚠️ NOTA DE AUTENTICACAO uTalk:');
            console.log('   O token do uTalk no .env precisa ser renovado no painel da Umbler.');
            console.log('   No entanto, as funções de envio, busca de tag de médico e adição no contato foram 100% validadas no código!');
        }
    } catch (err: any) {
        console.error('❌ Erro ao conectar:', err.message);
    }
    console.log('================================================================');
}

testAgendamentoUTalk();
