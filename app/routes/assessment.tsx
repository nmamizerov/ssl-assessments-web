import { useState, useMemo, useEffect } from "react";
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
  const [category, setCategory] = useState<"skills" | "places" | "recs">(
    "places"
  );
  const [categoryNav, setCategoryNav] = useState(0);
  const [recNav, setRecNav] = useState(0);
  const [hoursLeft, setHoursLeft] = useState<number>(0);

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
        const data = mainData.result.data.skills[rowS.skill.slug];
        rowS.data = data;
        skillArray.push(rowS);
      });
      skillArray.sort((a, b) => {
        return a?.data?.value > b?.data?.value ? 1 : -1;
      });
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

  // Расчет оставшихся часов до конца промокода (72 часа от created_at)
  useEffect(() => {
    const calculateHoursLeft = () => {
      if (!mainData?.result?.data?.["meta.created_at"]) return;

      const createdAt = new Date(
        mainData?.result?.data?.["meta.created_at"]
      ).getTime();
      const now = new Date().getTime();

      // Если created_at в будущем, используем текущее время
      const startTime = createdAt > now ? now : createdAt;
      const promoEndTime = startTime + 72 * 60 * 60 * 1000; // 72 часа в миллисекундах
      const timeLeft = promoEndTime - now;

      if (timeLeft > 0) {
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        // Ограничиваем максимум до 72 часов
        setHoursLeft(Math.min(hours, 72));
      } else {
        setHoursLeft(0);
      }
    };

    calculateHoursLeft();
    const interval = setInterval(calculateHoursLeft, 60000); // Обновляем каждую минуту

    return () => clearInterval(interval);
  }, [mainData]);

  const categoryFiltered = categoryComment[categoryNav] || {};
  const categoryRecFiltered = categoryComment[recNav] || {};

  if (!mainData) return <div>Загрузка...</div>;

  return (
    <div className="assessment-container mx-auto px-4 pb-32">
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
            className="flex flex-wrap items-center pb-2 mb-2 gap-4 flex-col md:flex-row test-result"
          >
            <div className="flex flex-1 items-center mb-2 md:mb-0">
              <div className="flex items-center flex-1 mr-5">
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
            <div className="flex-1">{cat.comment}</div>
          </div>
        ))}
      </div>

      {/* Информационная плашка */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-teal-500 rounded-lg p-4 my-6 shadow-sm">
        <div className="flex items-center">
          <svg
            className="w-5 h-5 text-teal-500 mr-3 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-gray-800 font-medium">
            Повышайте навыки на курсе{" "}
            <a
              href="https://courses.skillslab.center/communication"
              target="_blank"
              className="font-bold text-teal-700"
            >
              Осознанные коммуникации
            </a>{" "}
            Старт потока —{" "}
            <span className="font-semibold">
              {mainData?.result?.data?.["meta.ok_start_date"]}
            </span>
          </p>
        </div>
      </div>

      {/* Плашка с промокодом */}
      {/* {hoursLeft > 0 && ( */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center">
          <svg
            className="w-6 h-6 text-orange-500 mr-3 flex-shrink-0 animate-pulse"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-gray-800 font-medium">
            <span className="inline-flex items-center  text-orange-800 font-bold px-2 py-1 rounded mr-2">
              🔥 Осталось {hoursLeft}{" "}
              {hoursLeft === 1 ? "час" : hoursLeft < 5 ? "часа" : "часов"}
            </span>
            до конца промокода{" "}
            <span className="font-bold text-orange-700 px-2 py-1 rounded">
              {mainData?.result?.data?.["meta.code"]}
            </span>{" "}
            на скидку <span className="font-bold text-red-600">15%</span> на
            курс
          </p>
        </div>
      </div>
      {/* )} */}

      {/* Главная навигация */}
      <nav className="flex md:flex-row flex-col gap-2 my-10">
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
          <div className="section-title mt-4 block">
            Детальный разбор навыков
          </div>
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
                <div
                  dangerouslySetInnerHTML={{
                    __html: categoryFiltered.description || "",
                  }}
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {(categoryFiltered.skills_filtered || []).map((skill: any) => (
                  <div
                    key={skill.id}
                    className="bg-white rounded-lg shadow p-4"
                  >
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
                            padding: {
                              left: -15,
                              right: -15,
                              top: -15,
                              bottom: -15,
                            },
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
          <div className="section-title">
            Где и как успешно могут быть применены навыки
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {contextComment.map((context: any) => (
              <div
                key={context.id}
                className="bg-white rounded-lg shadow p-4 mt-2"
              >
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
                        padding: {
                          left: -15,
                          right: -15,
                          top: -15,
                          bottom: -15,
                        },
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
                      <div className="p-3  text-xs md:text-sm">Навык</div>
                      <div className="p-3 font-bold text-xs md:text-sm">
                        Ваш результат
                      </div>
                      <div className="p-3 font-bold text-xs md:text-sm ">
                        Необходимый уровень
                      </div>
                    </div>

                    {/* Строки с данными */}
                    {(context.data.missing || []).map(
                      (miss: any, idx: number) => (
                        <div
                          key={idx}
                          className={`grid grid-cols-3 bg-opacity-50 bg-${miss.color}-500`}
                        >
                          <div className="p-3 text-xs md:text-sm border-b border-black/20">
                            {miss.title}
                          </div>
                          <div className="p-3 text-xs md:text-sm font-bold border-b border-l border-black/20">
                            {miss.value}%
                          </div>
                          <div className="p-3 text-xs md:text-sm border-b border-x border-black/20">
                            от {miss.ideal_value}%
                          </div>
                        </div>
                      )
                    )}
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-3">
                    {(context.data.warnings || []).map(
                      (warn: any, idx: number) => (
                        <div
                          key={idx}
                          className={`alert alert-${warn.color} mb-0 flex items-center`}
                        >
                          {warn.text}
                        </div>
                      )
                    )}
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
          <div className="mt-3">
            <Rec
              books={categoryRecFiltered.books}
              excercises={categoryRecFiltered.excercises}
              more={categoryRecFiltered.more}
            />
          </div>
        </div>
      )}
    </div>
  );
}
