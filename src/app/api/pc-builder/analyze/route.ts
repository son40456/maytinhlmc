import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Models to try in order (fallback chain for rate limits)
const MODELS = [
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
];

interface AnalyzeRequest {
    products: {
        categoryId: string;
        name: string;
        specs?: string;
    }[];
}

interface CompatibilityResult {
    analyses: {
        categoryId: string;
        platform: 'intel' | 'amd' | null;
        socket: string | null;
        ddrType: 'ddr4' | 'ddr5' | null;
        formFactor: string | null;
    }[];
    warnings: string[];
    suggestions: string[];
}

export async function POST(request: NextRequest) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    try {
        const body: AnalyzeRequest = await request.json();
        const { products } = body;

        if (!products || products.length === 0) {
            return NextResponse.json({ error: 'No products provided' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

        // Build compact prompt
        const items = products.map(p => {
            let desc = `[${p.categoryId}] ${p.name}`;
            if (p.specs) desc += ` | ${p.specs.slice(0, 300)}`;
            return desc;
        }).join('\n');

        const prompt = `Phân tích tương thích linh kiện PC. Trả về JSON duy nhất:
${items}

JSON format:
{"analyses":[{"categoryId":"...","platform":"intel|amd|null","socket":"...","ddrType":"ddr4|ddr5|null","formFactor":"ATX|mATX|ITX|null"}],"warnings":["tiếng Việt"],"suggestions":["tiếng Việt"]}

Rules: CPU Intel=intel, AMD=amd. Mainboard chipset B760/Z790/H610=intel, B650/X670/A620=amd. Nếu CPU≠Mainboard platform → warning. RAM DDR≠Mainboard → warning. Chỉ JSON.`;

        // Try models in order
        let lastError: any = null;
        for (const modelName of MODELS) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const text = result.response.text();

                let jsonStr = text.trim();
                if (jsonStr.startsWith('```')) {
                    jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\s*$/g, '').trim();
                }

                const parsed: CompatibilityResult = JSON.parse(jsonStr);
                return NextResponse.json(parsed);
            } catch (err: any) {
                lastError = err;
                console.warn(`Model ${modelName} failed:`, err.message?.slice(0, 100));
                // If rate limited, try next model
                if (err.message?.includes('429') || err.message?.includes('quota')) {
                    continue;
                }
                // For other errors, throw immediately
                throw err;
            }
        }

        throw lastError || new Error('All models failed');
    } catch (error: any) {
        console.error('Gemini analysis error:', error);
        return NextResponse.json(
            { error: 'Analysis failed', details: error.message?.slice(0, 200) },
            { status: 500 }
        );
    }
}
