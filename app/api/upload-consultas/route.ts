import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
        }

        const validTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "O arquivo deve ser um PDF ou Imagem (JPG, PNG, WEBP)" }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "Variável GEMINI_API_KEY não configurada" }, { status: 500 });
        }

        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString("base64");

        const modelName = process.env.GEMINI_MODEL || "gemini-2.0-flash";
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = `Analise este documento ou imagem contendo uma lista de consultas.
    Extraia as seguintes informações para cada paciente listado:
    
    1. Paciente: O nome completo do paciente. IMPORTANTE: Remova rigorosamente qualquer número prefixo e o " - ". Exemplo: se o texto for "2251335 - ANA LETICIA", extraia apenas "ANA LETICIA". Remova também qualquer menção à idade (ex: "47 anos", "47a"). Remova espaços em branco extras no início ou fim.
    2. Hora: O horário da consulta (coluna Hora).
    3. Telefone: O número de telefone. Se houver "Celular", use-o. Se não, use "Telefone". Remova todos os caracteres não numéricos.
    4. Convênio: O nome do convênio ou forma de pagamento (colunas "Convênio" ou "Forma de Pgto").
    
    Retorne APENAS um array JSON válido contendo objetos com as propriedades: "patientName", "time", "phone", "insurance".
    Não inclua markdown (como \`\`\`json), apenas o JSON puro.`;

        const maxRetries = 3;

        for (let i = 0; i < maxRetries; i++) {
            try {
                console.log(`Iniciando tentativa ${i + 1} com Gemini...`);
                const result = await model.generateContent([
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: file.type,
                        },
                    },
                    { text: prompt },
                ]);

                const response = await result.response;
                const responseText = response.text() || "";
                console.log("Resposta bruta da IA recebida.");

                // Limpa possíveis blocos de markdown
                const cleanedText = responseText
                    .replace(/^```json\s*/, "")
                    .replace(/^```\s*/, "")
                    .replace(/\s*```$/, "");

                try {
                    const data = JSON.parse(cleanedText);

                    if (Array.isArray(data)) {
                        data.forEach((item: any) => {
                            if (item.patientName) {
                                item.patientName = item.patientName
                                    .replace(/\s\d+\s*anos/i, "")
                                    .replace(/\s\d+a$/i, "")
                                    .trim();
                            }

                            if (item.phone) {
                                const digits = item.phone.replace(/\D/g, "");
                                if (digits.length === 8 || digits.length === 9) {
                                    item.phone = `31${digits}`;
                                }
                            }
                        });
                    }

                    return NextResponse.json(data);
                } catch (parseError) {
                    console.error("Erro ao fazer parse do JSON do Gemini:", responseText);
                    return NextResponse.json({ 
                        error: "A IA retornou um formato inválido",
                        details: responseText.substring(0, 100)
                    }, { status: 500 });
                }

            } catch (error: any) {
                console.error(`Erro detalhado na tentativa ${i + 1}:`, {
                    message: error.message,
                    status: error.status,
                    stack: error.stack
                });

                const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("quota");
                if (isRateLimit && i < maxRetries - 1) {
                    const delay = 5000 * (i + 1);
                    console.log(`Aguardando ${delay}ms devido a limite de cota...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                if (i === maxRetries - 1) {
                    if (isRateLimit) {
                        return NextResponse.json({ error: "Limite de cota atingido na API do Google. Tente novamente em 1 minuto." }, { status: 429 });
                    }
                    return NextResponse.json({ error: `Erro na comunicação com a IA: ${error.message}` }, { status: 500 });
                }
            }
        }
    } catch (error: any) {
        console.error("Erro fatal no upload:", error);
        return NextResponse.json({ error: "Erro interno no servidor", details: error.message }, { status: 500 });
    }
}
