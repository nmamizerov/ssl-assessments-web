import { useState, useMemo } from "react";
import type { Route } from "./+types/assessment";
import ClientChart from "../components/ClientChart";
import Rec from "../components/Rec";
import "./assessment.css";

export async function loader({ params }: Route.LoaderArgs) {
    const response = await fetch(
        `https://api.university.skillslab.center/api/tests/main_data/?slug=${params.slug}`
    );
    const data = await response.json();

    return { data };
}

export default function AssessmentPage({ loaderData }: Route.ComponentProps) {
    const [category, setCategory] = useState<"skills" | "places" | "recs">("places");
    const [categoryNav, setCategoryNav] = useState(0);
    const [recNav, setRecNav] = useState(0);

    const mainData = loaderData.data;

    // Обработка категорий (аналог computed categoryComment)
    const categoryComment = useMemo(() => {
        if (!mainData) return [];
        const newArray: any[] = [];
        mainData.categories.forEach((cat: any) => {
            const row = { ...cat };
            row.color = mainData.result.data.category[row.slug].color;
            row.value = mainData.result.data.category[row.slug].value;
            row.comment = mainData.result.data.category[row.slug].comment;

            const skillArray: any[] = [];
            row.skills.forEach((skill: any) => {
                const rowS = { ...skill };
                rowS.data = mainData.result.data.skills[rowS.skill.slug];
                skillArray.push(rowS);
            });
            skillArray.sort((a, b) => (a.data.value > b.data.value ? 1 : -1));
            row.skills_filtered = skillArray;
            newArray.push(row);
        });
        return newArray.sort((a, b) => (a.value > b.value ? 1 : -1));
    }, [mainData]);

    // Обработка контекстов (аналог computed contextComment)
    const contextComment = useMemo(() => {
        if (!mainData) return [];
        const newArray: any[] = [];
        mainData.contexts.forEach((context: any) => {
            const row = { ...context };
            row.data = mainData.result.data.contexts[row.slug];
            newArray.push(row);
        });
        return newArray.sort((a, b) => (a.data.value > b.data.value ? 1 : -1));
    }, [mainData]);

    const categoryFiltered = categoryComment[categoryNav] || {};
    const categoryRecFiltered = categoryComment[recNav] || {};

    if (!mainData) return <div>Загрузка...</div>;

    return (
        <div className="assessment-container mx-auto px-4">
            <div className="flex justify-center mt-3">
                <div className="w-full">
                    <h4 className="tst-title mb-0">
                        Оценка навыков коммуникации: {mainData.result.name}
                    </h4>
                </div>
            </div>
            <div className="section-title mt-10">Общие оценки навыков</div>

            <div className="mt-2 mb-5">
                {categoryComment.map((cat: any) => (
                    <div
                        key={cat.id}
                        className="flex flex-wrap items-center pb-2 mb-2 test-result"
                    >
                        <div className="md:w-1/2 lg:w-1/3 flex items-center mb-2 md:mb-0">
                            <div className="flex items-center" style={{ width: "550px", maxWidth: "75%" }}>
                                <img
                                    src={`https://api.university.skillslab.center${cat.icon}`}
                                    alt=""
                                    className="w-6 mr-2"
                                />
                                <div className="font-bold mr-2" style={{ lineHeight: 1.2 }}>
                                    {cat.name}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <ClientChart
                                    type="radialBar"
                                    height={45}
                                    width={45}
                                    options={{
                                        height: 45,
                                        width: 45,
                                        grid: {
                                            show: false,
                                            padding: { left: -15, right: -15, top: -12, bottom: -15 },
                                        },
                                        colors: [cat.color],
                                        plotOptions: {
                                            radialBar: {
                                                hollow: { size: "22%" },
                                                track: { background: "#eee" },
                                                dataLabels: {
                                                    showOn: "always",
                                                    name: { show: false },
                                                    value: { show: false },
                                                },
                                            },
                                        },
                                        stroke: { lineCap: "round" },
                                    }}
                                    series={[parseInt(cat.value)]}
                                />
                                <div className="ml-1 font-bold">{cat.value}%</div>
                            </div>
                        </div>
                        <div className="md:w-1/2 lg:w-2/3">{cat.comment}</div>
                    </div>
                ))}
            </div>

            {/* Главная навигация */}
            <nav className="flex gap-2 my-10">
                <button
                    onClick={() => setCategory("places")}
                    className={`nav-button ${category === "places" ? "active" : ""}`}
                >
                    Сферы применения навыков
                </button>
                <button
                    onClick={() => setCategory("recs")}
                    className={`nav-button ${category === "recs" ? "active" : ""}`}
                >
                    Персональные рекомендациии
                </button>
                <button
                    onClick={() => setCategory("skills")}
                    className={`nav-button ${category === "skills" ? "active" : ""}`}
                >
                    Детальный разбор навыков
                </button>
            </nav>

            {/* Раздел Навыки */}
            {category === "skills" && (
                <div className="skills">

                    <div className="section-title mt-4 block">Детальный разбор навыков</div>
                    <div className="mt-2">
                        <nav className="flex flex-wrap gap-2 my-3">
                            {categoryComment.map((cat: any, index: number) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setCategoryNav(index)}
                                    className={`nav-button ${index === categoryNav ? "active" : ""}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </nav>
                        <div className="category-body mb-3">
                            <div className="py-3">
                                <div dangerouslySetInnerHTML={{ __html: categoryFiltered.description || "" }} />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                                {(categoryFiltered.skills_filtered || []).map((skill: any) => (
                                    <div key={skill.id} className="bg-white rounded-lg shadow p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <strong>{skill.skill.name}</strong>
                                            </div>
                                            <ClientChart
                                                type="radialBar"
                                                height={60}
                                                width={60}
                                                options={{
                                                    grid: {
                                                        show: false,
                                                        padding: { left: -15, right: -15, top: -15, bottom: -15 },
                                                    },
                                                    colors: [skill.data.color],
                                                    plotOptions: {
                                                        radialBar: {
                                                            hollow: { size: "42%" },
                                                            track: { background: "#eee" },
                                                            dataLabels: {
                                                                showOn: "always",
                                                                name: { show: false },
                                                                value: {
                                                                    show: true,
                                                                    fontSize: "14px",
                                                                    fontWeight: "bold",
                                                                    offsetY: 5,
                                                                },
                                                            },
                                                        },
                                                    },
                                                    stroke: { lineCap: "round" },
                                                }}
                                                series={[parseInt(skill.data.value)]}
                                            />
                                        </div>
                                        <img
                                            src={`https://api.university.skillslab.center${skill.img}`}
                                            className="mt-2 w-full"
                                            alt=""
                                        />
                                        <div
                                            className="mt-2 small-text"
                                            dangerouslySetInnerHTML={{ __html: skill.description }}
                                        />
                                        <div className="mt-2 w-full">
                                            <strong>Ваш результат</strong>
                                            {skill.data.notes.map((alert: any, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className={`alert alert-${alert.color} mt-2 flex items-center`}
                                                >
                                                    {alert.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Раздел Оценки по сферам применения */}
            {category === "places" && (
                <div className="places">
                    <div className="section-title">Где и как успешно могут быть применены навыки</div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {contextComment.map((context: any) => (
                            <div key={context.id} className="bg-white rounded-lg shadow p-4 mt-2">
                                <div className="flex">
                                    <div className="mr-2 flex-1">
                                        <strong className="block category">{context.name}</strong>
                                        <div
                                            className="category-detail mt-2"
                                            dangerouslySetInnerHTML={{ __html: context.description }}
                                        />
                                    </div>
                                    <ClientChart
                                        type="radialBar"
                                        height={90}
                                        width={90}
                                        options={{
                                            grid: {
                                                show: false,
                                                padding: { left: -15, right: -15, top: -15, bottom: -15 },
                                            },
                                            colors: [context.data.color],
                                            plotOptions: {
                                                radialBar: {
                                                    hollow: { size: "42%" },
                                                    track: { background: "#eee" },
                                                    dataLabels: {
                                                        showOn: "always",
                                                        name: { show: false },
                                                        value: {
                                                            show: true,
                                                            fontSize: "14px",
                                                            fontWeight: "bold",
                                                            offsetY: 5,
                                                        },
                                                    },
                                                },
                                            },
                                            stroke: { lineCap: "round" },
                                        }}
                                        series={[parseInt(context.data.value)]}
                                    />
                                </div>
                                <div>
                                    <ClientChart
                                        type="radar"
                                        height={400}
                                        options={{
                                            chart: {
                                                toolbar: { show: false },
                                                dropShadow: {
                                                    enabled: false,
                                                    blur: 8,
                                                    left: 1,
                                                    top: 1,
                                                    opacity: 0.2,
                                                },
                                            },
                                            legend: {
                                                show: true,
                                                fontSize: "14px",
                                                fontFamily: "Montserrat",
                                            },
                                            yaxis: {
                                                show: false,
                                                max: 100,
                                                tickAmount: 5,
                                            },
                                            colors: ["black", "#00d4bd", "#826bf8"],
                                            xaxis: {
                                                categories: context.data.labels,
                                            },
                                            fill: { opacity: [1, 0.8] },
                                            stroke: { show: false, width: 0 },
                                            markers: { size: 0 },
                                            grid: { show: false },
                                        }}
                                        series={context.data.series}
                                    />
                                </div>
                                <div>
                                    <strong className="block category">Чего не хватает</strong>
                                    <div className="mt-2">
                                        {/* Заголовки таблицы */}
                                        <div className="grid grid-cols-3 bg-gray-100">
                                            <div className="p-3  text-sm">
                                                Навык
                                            </div>
                                            <div className="p-3 font-bold text-sm">
                                                Ваш результат
                                            </div>
                                            <div className="p-3 font-bold text-sm ">
                                                Необходимый уровень
                                            </div>
                                        </div>

                                        {/* Строки с данными */}
                                        {(context.data.missing || []).map((miss: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`grid grid-cols-3 bg-opacity-50 bg-${miss.color}-500`}
                                            >
                                                <div className="p-3 text-sm border-b border-black/20">
                                                    {miss.title}
                                                </div>
                                                <div className="p-3 text-sm font-bold border-b border-l border-black/20">
                                                    {miss.value}%
                                                </div>
                                                <div className="p-3 text-sm border-b border-x border-black/20">
                                                    от {miss.ideal_value}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 mt-3">
                                        {(context.data.warnings || []).map((warn: any, idx: number) => (
                                            <div
                                                key={idx}
                                                className={`alert alert-${warn.color} mb-0 flex items-center`}
                                            >
                                                {warn.text}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Раздел Персональные рекомендации */}
            {category === "recs" && (
                <div className="recs">
                    <div className="section-title">
                        Подобранные для вас ресурсы и упражнения для развития нужных навыков
                    </div>
                    <nav className="flex flex-wrap gap-2 mt-3 mb-3">
                        {categoryComment.map((cat: any, num: number) => (
                            <button
                                key={num}
                                onClick={() => setRecNav(num)}
                                className={`nav-button ${num === recNav ? "active" : ""}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </nav>

                    {(categoryRecFiltered.skills_filtered || []).map((skill: any) => (
                        <div key={skill.id} className="mt-3">
                            <Rec skill={skill} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
