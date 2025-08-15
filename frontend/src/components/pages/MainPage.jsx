import { useState } from 'react';
import styles from '../../styles/pages/MainPage.module.scss';

export default function MainPage() {  
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeIndexCategory, setActiveIndexCategory] = useState(0);

    return (
    <section>
        <header>
            <nav className={styles.topNavbar}>
                <div className={styles.navbarRow}>
                    <h1 className={styles.brand}> 🏗️ Система управления строительными проектами </h1>
                    <div className={styles.topActions}>
                        <button className={`${styles.btn} ${styles.btnSuccess}`} >➕ Добавить работу</button>
                        <button className={`${styles.btn} ${styles.btnPrimary}`} >🏗️ Новый проект</button>
                        <button className={`${styles.btn} ${styles.btnWarning}`}>📥 Экспорт</button>
                    </div>
                </div>

                <div className={styles.navbarRow}>
                    <div className={styles.globalSearchContainer}>
                        <input type="text" className={styles.searchInput} id="globalSearchInput" placeholder="🔍 Поиск по работам, объектам, этажам, исполнителям..."/>
                        
                        <div className={styles.filtersGroup}>
                            {[
                                { id: "allWorksFilter", label: "📋 Все работы" },
                                { id: "completedFilter", label: "✅ Выполненные" },
                                { id: "notCompletedFilter", label: "⏳ Невыполненные" },
                                { id: "todayFilter", label: "📅 Сегодня" },
                                { id: "overdueFilter", label: "🚨 Просрочено"},
                            ].map((cat, index) => (
                                <button
                                    key={cat.id}
                                    id={cat.id}
                                    className={`${styles.filterBtn} ${activeIndex === index ? styles.active : ""}`}
                                    onClick={() => setActiveIndex(cat.id)}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className={styles.navbarRow}>
                    <div className={styles.categoryFilters} id="categoryFilters">
                        {[
                            { id: "allCategories", label: "Все категории" },
                            { id: "roughWork", label: "Черновые" },
                            { id: "finishingWorks", label: "Отделочные" },
                            { id: "ceilings", label: "Потолки" },
                            { id: "сonstructions", label: "Конструкции"},
                            { id: "finalWorks", label: "Завершающие"},
                        ].map((cat, index) => (
                            <button
                                key={cat.id}
                                id={cat.id}
                                className={`${styles.filterBtn} ${activeIndexCategory === index ? styles.active : ""}`}
                                onClick={() => setActiveIndexCategory(index)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            <aside className={styles.bottomNavbar}>
                <div className={styles.projectInfo}>
                    <select className={styles.projectSelect} id="activeProjectSelect">
                        <option value="all">🌐 Все проекты</option>
                    </select>
                    <div className={styles.projectMeta} id="projectMeta">
                            Выберите проект для детального просмотра
                    </div>
                </div>
                    
                <div>
                    <button className={`${styles.btn} ${styles.btnPrimary}`}>⚙️ Управление проектами</button>
                </div>
            </aside>
        </header>
        <main>
            <aside className={styles.container}>
                <div className={styles.dashboard}>
                <div className={styles.dashboardHeader}>
                        <div className={styles.dashboardTitle}>
                            <span id="dashboardIcon">📊</span>
                            <span id="dashboardTitle">Общий дашборд всех проектов</span>
                        </div>
                        <div className={styles.dashboardActions}>
                            <select className={styles.formControl} id="sortBySelect">
                                <option value="default">📋 По умолчанию</option>
                                <option value="technology">🔧 По технологии</option>
                                <option value="progress">📊 По прогрессу</option>
                                <option value="date">📅 По датам</option>
                                <option value="status">🏷️ По статусу</option>
                                <option value="floor">🏢 По этажам</option>
                                <option value="category">📁 По категориям</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="totalWorks">0</div>
                            <div className={styles.statLabel}>Всего работ</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="visibleWorks">0</div>
                            <div className={styles.statLabel}>Показано работ</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="completedWorks">0</div>
                            <div className={styles.statLabel}>Завершено</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="inProgressWorks">0</div>
                            <div className={styles.statLabel}>В процессе</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="overdueWorks">0</div>
                            <div className={styles.statLabel}>Просрочено</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="avgProgress">0%</div>
                            <div className={styles.statLabel}>Средний прогресс</div>
                        </div>
                    </div>
                </div>
            </aside>
            <section>       
                <div className={styles.mainWorkspace}>
                    <div className={styles.sidebar}>
                        <div className={styles.sidebarSection}>
                            <div className={styles.sidebarTitle}>
                                🗂️ Структура проектов
                            </div>
                            <div id="projectTree">
                               
                            </div>
                        </div>

                        <div className={styles.sidebarSection}>
                            <div className={styles.sidebarTitle}>
                                🔧 Быстрые действия
                            </div>
                            <div className={styles.sidebarBtn}>
                                <button className={`${styles.btn} ${styles.btnSuccess}`}>➕ Добавить работу</button>
                                <button className={`${styles.btn} ${styles.btnPrimary}`}>🏗️ Новый проект</button>
                                <button className={`${styles.btn} ${styles.btnWarning}`}>📥 Экспорт данных</button>
                                <button className={`${styles.btn} ${styles.btnInfo}`}>📊 Создать отчет</button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.contentArea}>
                        <div className={styles.contentHeader}>
                            <div className={styles.contentTitle} id="contentTitle">
                                📋 Выберите проект для просмотра работ
                            </div>
                            <div className={styles.contentActions}>
                                <button className={`${styles.btn} ${styles.btnSuccess}`} >➕ Добавить работу</button>
                            </div>
                        </div>
                        
                        <div id="worksContainer">
                            <div className={styles.emptyState}>
                                <div className={styles.emptyStateIcon}>🏗️</div>
                                    <h3>Добро пожаловать в систему управления строительными проектами</h3>
                                    <p>Создайте новый проект или выберите существующий для начала работы</p>
                                <button className={`${styles.btn} ${styles.btnPrimary}`}>🏗️ Создать первый проект</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    </section>
    );
}
