// Component hiển thị thông số kỹ thuật sản phẩm, tự động parse từ text

interface ProductSpecsProps {
    shortDescription: string;
    attributes?: any;
}

export function ProductSpecs({ shortDescription, attributes }: ProductSpecsProps) {
    // 1. Trích xuất thông tin từ shortDescription (nếu có định dạng >>>)
    const extractSpecsFromText = (text: string) => {
        const lines = text.replace(/<[^>]+>/g, "\n").split("\n").map(l => l.trim()).filter(l => l);
        const specs: Array<{ label: string; value: string }> = [];
        let importantNote = "";

        lines.forEach(line => {
            if (line.startsWith(">>>")) {
                importantNote = line.replace(">>>", "").trim();
            } else if (line.includes(":")) {
                const [label, ...valueParts] = line.split(":");
                specs.push({
                    label: label.trim(),
                    value: valueParts.join(":").trim()
                });
            }
        });

        return { specs, importantNote };
    };

    const { specs, importantNote } = extractSpecsFromText(shortDescription || "");

    // 2. Trích xuất từ attributes (nếu có)
    const attrSpecs = attributes?.nodes?.map((attr: any) => ({
        label: attr.label || attr.name,
        value: attr.options?.join(", ") || ""
    })) || [];

    // Gộp cả 2 nguồn (ưu tiên attributes nếu trùng lặp?)
    const allSpecs = [...specs];
    attrSpecs.forEach((as: any) => {
        if (!allSpecs.find(s => s.label.toLowerCase() === as.label.toLowerCase())) {
            allSpecs.push(as);
        }
    });

    if (allSpecs.length === 0 && !importantNote) return null;

    return (
        <div className="space-y-6">
            {importantNote && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                    <p className="text-sm text-blue-800 font-medium">{importantNote}</p>
                </div>
            )}

            {allSpecs.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        Thông số kỹ thuật
                    </h3>
                    <div className="space-y-3">
                        {allSpecs.map((spec, idx) => (
                            <div key={idx} className="flex border-b border-gray-200 pb-2 last:border-0 last:pb-0">
                                <span className="w-1/3 text-sm text-gray-500 font-medium">{spec.label}</span>
                                <span className="w-2/3 text-sm text-gray-900 font-semibold">{spec.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
