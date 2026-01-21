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

        const buffer = await file.arrayBuffer();
        const base64Data = Buffer.from(buffer).toString("base64");

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Chave de API do Gemini não configurada" }, { status: 500 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Analise este documento ou imagem contendo uma lista de consultas.
    Extraia as seguintes informações para cada paciente listado:
    
    1. Paciente: O nome completo do paciente. IMPORTANTE: Remova rigorosamente qualquer número prefixo e o " - ". Exemplo: se o texto for "2251335 - ANA LETICIA", extraia apenas "ANA LETICIA". Remova espaços em branco extras no início ou fim.
    2. Hora: O horário da consulta (coluna Hora).
    3. Telefone: O número de telefone. Se houver "Celular", use-o. Se não, use "Telefone". Remova todos os caracteres não numéricos.
    
    Retorne APENAS um array JSON válido contendo objetos com as propriedades: "patientName", "time", "phone".
    Não inclua markdown (como \`\`\`json), apenas o JSON puro.`;

        const maxRetries = 3;
        let textStart = 0;

        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await model.generateContent([
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: file.type,
                        },
                    },
                    prompt,
                ]);

                console.log({ result });
                const responseText = result.response.text();

                // Clean up potential markdown code blocks
                const cleanedText = responseText
                    .replace(/^```json\s*/, "")
                    .replace(/^```\s*/, "")
                    .replace(/\s*```$/, "");

                try {
                    const data = JSON.parse(cleanedText);

                    // Normalize phone numbers
                    if (Array.isArray(data)) {
                        data.forEach((item: any) => {
                            if (item.phone) {
                                // Remove non-numeric characters to check length
                                const digits = item.phone.replace(/\D/g, "");
                                // If length is 8 or 9 (standard mobile/fixed without DD), add 31
                                if (digits.length === 8 || digits.length === 9) {
                                    item.phone = `31${digits}`;
                                }
                            }
                        });
                    }

                    return NextResponse.json(data);
                } catch (parseError) {
                    console.error("Erro ao fazer parse do JSON do Gemini:", responseText);
                    return NextResponse.json({ error: "Falha ao processar resposta da IA" }, { status: 500 });
                }

            } catch (error: any) {
                console.error(`Tentativa ${i + 1} falhou:`, error);

                if (error.status === 429 && i < maxRetries - 1) {
                    const delay = 5000 * (i + 1); // 5s, 10s...
                    console.log(`Aguardando ${delay}ms antes de tentar novamente...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }

                // If it's the last retry or not a 429 error, throw it to be caught by the outer catch
                if (i === maxRetries - 1) {
                    // If 429 persisted, return a specific user friendly error
                    if (error.status === 429) {
                        return NextResponse.json({ error: "O serviço de IA está sobrecarregado no momento. Por favor, tente novamente em alguns segundos." }, { status: 429 });
                    }
                    throw error;
                }
            }
        }
    } catch (error) {
        console.error("Erro no upload:", error);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}
