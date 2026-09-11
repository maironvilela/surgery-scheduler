/**
 * Script de teste HTTP para a rota /api/utalk/send
 */

async function runTest() {
    console.log('----------------------------------------------------');
    console.log('🧪 Teste de Integração uTalk: Envio + Tag no Chat');
    console.log('----------------------------------------------------');

    const testPayload = {
        toPhone: '+5531987205436',
        message: '[Teste de Integração] Confirmação de consulta',
        contactName: 'Paciente Teste Integração',
        doctorName: 'Dr. Rômulo Oliveira'
    };

    console.log('1. Enviando requisição para http://localhost:4000/api/utalk/send...');

    try {
        const res = await fetch('http://localhost:4000/api/utalk/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testPayload)
        });

        console.log('2. Status HTTP:', res.status);
        const data = await res.json();
        console.log('3. Resposta JSON:', JSON.stringify(data, null, 2));
        console.log('----------------------------------------------------');

        if (data.success) {
            console.log('✅ Mensagem enviada via uTalk com sucesso!');
            if (data.tagged) {
                console.log('✅ TAG ADICIONADA AO CHAT COM SUCESSO!');
            } else {
                console.log('⚠️ Mensagem enviada, mas a tag não pôde ser associada.');
            }
        } else {
            console.error('❌ Falha:', data.error);
        }
    } catch (err) {
        console.error('❌ Erro na conexão com o servidor local (Certifique-se que o npm run dev está rodando na porta 4000):', err);
    }
}

runTest();
