import { useEffect, useState, lazy, Suspense } from "react";

const Chart = lazy(() => import("react-apexcharts"));

interface ClientChartProps {
    type: "radialBar" | "radar" | "line" | "bar" | "area";
    height: number;
    width?: number;
    options: any;
    series: any;
    className?: string;
}

export default function ClientChart({ type, height, width, options, series, className }: ClientChartProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <div
                className={`bg-gray-100 rounded ${className || ""}`}
                style={{ width: width || "100%", height }}
            />
        );
    }

    return (
        <Suspense fallback={<div className={`bg-gray-100 rounded ${className || ""}`} style={{ width: width || "100%", height }} />}>
            <Chart type={type} height={height} width={width} options={options} series={series} className={className} />
        </Suspense>
    );
}

