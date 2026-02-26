import React from "react";

interface DetailedSpecsTableProps {
    shortDescription: string;
    attributes?: any;
}

export function DetailedSpecsTable({ shortDescription, attributes }: DetailedSpecsTableProps) {
    // 1. Extract info from shortDescription
    const extractSpecsFromText = (text: string) => {
        const lines = text.replace(/<[^>]+>/g, "\n").split("\n").map(l => l.trim()).filter(l => l);
        const specs: Array<{ label: string; value: string }> = [];

        lines.forEach(line => {
            if (line.includes(":") && !line.startsWith(">>>")) {
                const [label, ...valueParts] = line.split(":");
                specs.push({
                    label: label.trim(),
                    value: valueParts.join(":").trim()
                });
            }
        });

        return specs;
    };

    const specs = extractSpecsFromText(shortDescription || "");

    // 2. Extract from attributes (if any)
    const attrSpecs = attributes?.nodes?.map((attr: any) => ({
        label: attr.label || attr.name,
        value: attr.options?.join(", ") || ""
    })) || [];

    // Merge both sources
    const allSpecs = [...specs];
    attrSpecs.forEach((as: any) => {
        if (!allSpecs.find(s => s.label.toLowerCase() === as.label.toLowerCase())) {
            allSpecs.push(as);
        }
    });

    if (allSpecs.length === 0) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                <h3 className="text-xl font-bold text-gray-900 m-0">
                    Thông số kỹ thuật
                </h3>
            </div>
            <div className="p-0">
                <table className="w-full text-left text-sm text-gray-700">
                    <tbody className="divide-y divide-slate-100">
                        {allSpecs.map((spec, idx) => (
                            <tr key={idx} className="even:bg-slate-50 hover:bg-blue-50/50 transition-colors">
                                <td className="py-4 px-6 font-medium text-slate-500 w-1/3 align-top">
                                    {spec.label}
                                </td>
                                <td className="py-4 px-6 text-slate-800 font-semibold align-top">
                                    {spec.value}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
