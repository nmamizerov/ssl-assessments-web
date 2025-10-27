import { useState } from "react";
import { BookOpen, GraduationCap, Dumbbell, Info } from "lucide-react";

interface RecProps {
  books: string;
  excercises: string;
  more: string;
}

export default function Rec({ books, excercises, more }: RecProps) {
  const [recNavDetail, setRecNavDetail] = useState(0);

  const tabs = [
    { id: 0, label: "Книги", icon: BookOpen, content: books },
    {
      id: 2,
      label: "Упражнения",
      icon: Dumbbell,
      content: excercises,
    },
    { id: 3, label: "Другие материалы", icon: Info, content: more },
  ];

  return (
    <>
      <nav className="flex flex-wrap gap-2 mb-3 w-full mt-5">
        {tabs
          .filter((tab) => tab.content)
          .map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setRecNavDetail(tab.id)}
                className={`flex items-center gap-1 px-3 text-sm py-1 rounded transition-colors ${
                  recNavDetail === tab.id
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
    </>
  );
}
