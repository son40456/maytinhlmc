import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface AnalyzeRequest {
    products: {
        categoryId: string;
        name: string;
        specs?: string; // ACF HTML stripped text
    }[];
}

interface ComponentAnalysis {
    categoryId: string;
    platform: 'intel' | 'amd' | null;
    socket: string | null;
    ddrType: 'ddr4' | 'ddr5' | null;
    formFactor: string | null;
}

interface CompatibilityResult {
    analyses: ComponentAnalysis[];
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
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Build prompt
        const productDescriptions = products.map(p => {
            let desc = `[${p.categoryId}] ${p.name}`;
            if (p.specs) desc += `\nThông số: ${p.specs}`;
            return desc;
        }).join('\n\n');

        const prompt = `Bạn là chuyên gia phần cứng máy tính. Phân tích các linh kiện sau và trả về JSON:

${productDescriptions}

Trả về JSON duy nhất (không markdown, không giải thích):
{
  "analyses": [
    {
      "categoryId": "id của category",
      "platform": "intel" hoặc "amd" hoặc null,
      "socket": "tên socket nếu biết" hoặc null,
      "ddrType": "ddr4" hoặc "ddr5" hoặc null,
      "formFactor": "ATX/mATX/ITX" hoặc null
    }
  ],
  "warnings": ["cảnh báo tương thích nếu có - viết tiếng Việt"],
  "suggestions": ["gợi ý cho người dùng nếu có - viết tiếng Việt"]
}

Quy tắc:
- CPU Intel (Core i3/i5/i7/i9, Pentium, Celeron) → platform: "intel"
- CPU AMD (Ryzen 3/5/7/9, Athlon) → platform: "amd"  
- Mainboard dùng chipset Intel (B760, Z790, H610...) → platform: "intel"
- Mainboard dùng chipset AMD (B650, X670, A620...) → platform: "amd"
- Nếu CPU và Mainboard khác platform → warning
- Nếu RAM DDR type khác Mainboard → warning
- Chỉ trả về JSON, không giải thích gì thêm`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Parse JSON from response (handle potential markdown wrapping)
        let jsonStr = text.trim();
        if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```\s*$/g, '').trim();
        }

        const parsed: CompatibilityResult = JSON.parse(jsonStr);

        return NextResponse.json(parsed);
    } catch (error: any) {
        console.error('Gemini analysis error:', error);
        return NextResponse.json(
            { error: 'Analysis failed', details: error.message },
            { status: 500 }
        );
    }
}
