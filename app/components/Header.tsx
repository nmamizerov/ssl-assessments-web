import "./Header.css";

export default function Header() {
    return (
        <header className="site-header py-5">
            <div className="header-container">
                <img src="/logo.svg" alt="SkillsLab" className="logo h-[32px]" />

                <nav className="main-nav">
                    <a href="https://courses.skillslab.center/" className="nav-link">Курсы</a>
                    <a href="https://courses.skillslab.center/b2b" className="nav-link">Бизнесу</a>
                    <a href="https://courses.skillslab.center/reviews" className="nav-link">Отзывы</a>
                </nav>
            </div>
        </header>
    );
}

