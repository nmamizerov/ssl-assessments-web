import { useState } from "react";
import { BookOpen, GraduationCap, Dumbbell, Info } from "lucide-react";

interface RecProps {
    skill: {
        id: number;
        skill: {
            name: string;
            books: string;
            simulators: string;
            excercises: string;
            more: string;
        };
        img: string;
        description: string;
    };
}

export default function Rec({ skill }: RecProps) {
    const [recNavDetail, setRecNavDetail] = useState(0);

    const tabs = [
        { id: 0, label: "Книги", icon: BookOpen, content: skill.skill.books },
        { id: 1, label: "Навык в симуляторе за 10 минут", icon: GraduationCap, content: skill.skill.simulators },
        { id: 2, label: "Упражнения для саморазвития", icon: Dumbbell, content: skill.skill.excercises },
        { id: 3, label: "Еще о навыке", icon: Info, content: skill.skill.more },
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-bold mb-2">{skill.skill.name}</h3>
            <div className="my-3">
                <div
                    dangerouslySetInnerHTML={{
                        __html: `<img src='https://api.university.skillslab.center${skill.img}' style='float:left; max-width:30%;' />${skill.description}`,
                    }}
                />
            </div>
            <div className="clear-both"></div>
            <nav className="flex flex-wrap gap-2 mb-3 w-full">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setRecNavDetail(tab.id)}
                            className={`flex items-center gap-1 px-4 py-2 rounded transition-colors ${recNavDetail === tab.id
                                ? "bg-[#45adbf] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
            <div className="mt-2">
                <div dangerouslySetInnerHTML={{ __html: tabs[recNavDetail].content }} />
            </div>
        </div>
    );
}

