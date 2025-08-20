import { useState, useEffect, useMemo } from 'react';
import styles from '../../styles/pages/MainPage.module.scss';
import { useProjects } from '../../../hooks/useProjects';
import { useWorks } from '../../../hooks/useWorks';
import { useWorkTypes } from '../../../hooks/useWorkTypes';
import { useExecutors } from '../../../hooks/useExecutors';
import { seedData as seedDataApi } from '../../../api';

import ProjectManagerWindow from '../common/ProjectManagerWindow';
import CreateWorkWindow from '../common/CreateWorkWindow';
import CreateProjectWindow from '../common/CreateProjectWindow';
import EditWindow from '../common/EditWindow';

export default function MainPage() {  
    const [activeProject, setActiveProject] = useState('all');
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedBlock, setSelectedBlock] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState(null);
    const [globalFilter, setGlobalFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [currentSort, setCurrentSort] = useState('default');
    const [searchTerm, setSearchTerm] = useState('');

    const [isProjectManagerOpen, setIsProjectManagerOpen] = useState(false);
    const [isCreateWorkModalOpen, setIsCreateWorkModalOpen] = useState(false);
    const [isEditWorkModalOpen, setIsEditWorkModalOpen] = useState(false);
    const [editingWork, setEditingWork] = useState(null);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    const { projects, fetchProjects, addProject, editProject, removeProject } = useProjects();
    const { works, fetchWorks, addWork, editWork, removeWork } = useWorks();
    const { workTypes, fetchWorkTypes } = useWorkTypes();
    const { executors, fetchExecutors } = useExecutors();

    useEffect(() => {
        fetchProjects();
        fetchWorks();
        fetchWorkTypes();
        fetchExecutors();
    }, [fetchProjects, fetchWorks, fetchWorkTypes, fetchExecutors]);

    const handleSeedData = async () => {
        try {
            await seedDataApi();
            await fetchProjects();
            await fetchWorks();
            await fetchWorkTypes();
            await fetchExecutors();
            showNotification('Demo data seeded successfully!', 'success');
        } catch (error) {
            console.error('Error seeding data:', error);
            showNotification('Error seeding demo data', 'error');
        }
    };

    const getStatusText = (status) => {
        const statusTexts = {
            'not-started': 'Не начато',
            'in-progress': 'В процессе',
            'completed': 'Завершено',
            'overdue': 'Просрочено'
        };
        return statusTexts[status] || status;
    };

    const getPriorityText = (priority) => {
        const priorityTexts = {
            'low': 'Низкий',
            'medium': 'Средний',
            'high': 'Высокий'
        };
        return priorityTexts[priority] || priority;
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return 'Не указано';
        }
        
        let date;
        
        const dateParts = dateString.split('-');
        if (dateParts.length === 3) {
            date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        } else {
            date = new Date(dateString);
        }
        
        if (isNaN(date.getTime())) {
            return 'Некорректная дата';
        }
    
        return date.toLocaleDateString('ru-RU');
    };

    const showNotification = (message, type) => {
        const notification = document.createElement('div');
        notification.className = `notification ${type || 'success'}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    };


    const worksForProject = activeProject === 'all' 
    ? works 
    : works.filter(w => w.project === activeProject);

    const totalProjects = projects.length;
    const projectWorksAverageProgress = worksForProject.length > 0
    ? Math.round(worksForProject.reduce((sum, w) => sum + w.progress, 0) / worksForProject.length)
    : 0;

    const filteredAndSortedWorks = useMemo(() => {
        let filtered = [...works];

        if (activeProject !== 'all') {
            filtered = filtered.filter(w => w.project === activeProject);
        }

        switch (globalFilter) {
            case 'completed':
                filtered = filtered.filter(w => w.status === 'completed');
                break;
            case 'not-completed':
                filtered = filtered.filter(w => w.status !== 'completed');
                break;
            case 'today':
                const today = new Date().toISOString().split('T')[0];
                filtered = filtered.filter(w => 
                    w.startDate <= today && w.endDate >= today
                );
                break;
            case 'overdue':
                filtered = filtered.filter(w => w.status === 'overdue');
                break;
            default:
                break;
        }

        if (categoryFilter !== 'all') {
            filtered = filtered.filter(w => w.category === categoryFilter);
        }

        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            filtered = filtered.filter(w => 
                w.workType.toLowerCase().includes(lowerCaseSearchTerm) ||
                w.object.toLowerCase().includes(lowerCaseSearchTerm) ||
                w.executor.toLowerCase().includes(lowerCaseSearchTerm) ||
                w.block.toLowerCase().includes(lowerCaseSearchTerm) ||
                w.floor.toLowerCase().includes(lowerCaseSearchTerm) ||
                (w.note && w.note.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (projects.find(p => p.code === w.project) && projects.find(p => p.code === w.project).name.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }

        if (selectedProject && selectedBlock && selectedFloor) {
            filtered = filtered.filter(w => 
                w.project === selectedProject && 
                w.block === selectedBlock && 
                w.floor === selectedFloor
            );
        } else if (selectedProject && selectedBlock) {
            filtered = filtered.filter(w => 
                w.project === selectedProject && 
                w.block === selectedBlock
            );
        } else if (selectedProject) {
            filtered = filtered.filter(w => w.project === selectedProject);
        }

        return [...filtered].sort((a, b) => {
            switch (currentSort) {
                case 'technology':
                    return (a.techOrder || 0) - (b.techOrder || 0);
                case 'progress':
                    return (b.progress || 0) - (a.progress || 0);
                case 'date':
                    return new Date(a.startDate) - new Date(b.startDate);
                case 'status':
                    const statusOrder = { 'overdue': 0, 'in-progress': 1, 'not-started': 2, 'completed': 3 };
                    return statusOrder[a.status] - statusOrder[b.status];
                case 'floor':
                    const parseFloor = (floor) => {
                        const num = parseInt(floor);
                        return isNaN(num) ? floor : num;
                    };
                    const floorA = parseFloor(a.floor);
                    const floorB = parseFloor(b.floor);

                    if (typeof floorA === 'number' && typeof floorB === 'number') {
                        return floorA - floorB;
                    } else {
                        return String(floorA).localeCompare(String(floorB));
                    }
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return (a.id || 0) - (b.id || 0);
            }
        });
    }, [works, activeProject, globalFilter, categoryFilter, searchTerm, selectedProject, selectedBlock, selectedFloor, currentSort, projects]);

    const totalWorksCount = works.length;
    const visibleWorksCount = filteredAndSortedWorks.length;
    const dashboardCompletedWorks = filteredAndSortedWorks.filter(w => w.status === 'completed').length;
    const dashboardInProgressWorks = filteredAndSortedWorks.filter(w => w.status === 'in-progress').length;
    const dashboardOverdueWorks = filteredAndSortedWorks.filter(w => w.status === 'overdue').length;
    const dashboardAvgProgress = filteredAndSortedWorks.length > 0 
        ? Math.round(filteredAndSortedWorks.reduce((sum, w) => sum + w.progress, 0) / filteredAndSortedWorks.length)
        : 0;

    return (
    <section>
        <header>
            <nav className={styles.topNavbar}>
                <div className={styles.navbarRow}>
                    <h1 className={styles.brand}> 🏗️ Система управления строительными проектами </h1>
                    <div className={styles.topActions}>
                        <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => setIsCreateWorkModalOpen(true)}>➕ Добавить работу</button> 
                        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsProjectModalOpen(true)}>🏗️ Новый проект</button>
                        <button className={`${styles.btn} ${styles.btnWarning}`} onClick={handleSeedData}>📥 Загрузить демо данные</button>
                    </div>
                </div>

                <div className={styles.navbarRow}>
                    <div className={styles.globalSearchContainer}>
                        <input 
                            type="text" 
                            className={styles.searchInput} 
                            id="globalSearchInput" 
                            placeholder="🔍 Поиск по работам, объектам, этажам, исполнителям..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        
                        <div className={styles.filtersGroup}>
                            {[
                                { id: "allWorksFilter", label: "📋 Все работы", filterType: "all" },
                                { id: "completedFilter", label: "✅ Выполненные", filterType: "completed" },
                                { id: "notCompletedFilter", label: "⏳ Невыполненные", filterType: "not-completed" },
                                { id: "todayFilter", label: "📅 Сегодня", filterType: "today" },
                                { id: "overdueFilter", label: "🚨 Просрочено", filterType: "overdue"},
                            ].map((cat, index) => (
                                <button
                                    key={cat.id}
                                    id={cat.id}
                                    className={`${styles.filterBtn} ${globalFilter === cat.filterType ? styles.active : ""}`}
                                    onClick={() => setGlobalFilter(cat.filterType)}
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
                            { id: "allCategories", label: "Все категории", categoryType: "all" },
                            { id: "roughWork", label: "Черновые", categoryType: "Черновые работы" },
                            { id: "finishingWorks", label: "Отделочные", categoryType: "Отделочные работы" },
                            { id: "ceilings", label: "Потолки", categoryType: "Потолки" },
                            { id: "сonstructions", label: "Конструкции", categoryType: "Конструкции"},
                            { id: "finalWorks", label: "Завершающие", categoryType: "Завершающие работы"},
                        ].map((cat) => (
                            <button
                                key={cat.id}
                                id={cat.id}
                                className={`${styles.categoryFilter} ${categoryFilter === cat.categoryType ? styles.active : ""}`}
                                onClick={() => setCategoryFilter(cat.categoryType)}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

            <aside className={styles.bottomNavbar}>
                <div className={styles.projectInfo}>
                    <select 
                        className={styles.projectSelect} 
                        id="activeProjectSelect"
                        value={activeProject}
                        onChange={(e) => setActiveProject(e.target.value)}
                    >
                        <option value="all">🌐 Все проекты</option>
                        {projects.map(project => (
                            <option key={project.code} value={project.code}>
                                {project.icon} {project.name}
                            </option>
                        ))}
                    </select>
                    <div className={styles.projectMeta} id="projectMeta">
                            {activeProject === 'all' ? 
                                `${projects.length} проектов, ${works.length} работ` 
                                : projects.find(p => p.code === activeProject) ? 
                                    `${projects.find(p => p.code === activeProject).blocks.length} блоков, ${works.filter(w => w.project === activeProject).length} работ` 
                                    : 'Выберите проект для детального просмотра'
                            }
                    </div>
                </div>
                    
                <div>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsProjectManagerOpen(true)}>⚙️ Управление проектами</button>
                </div>
            </aside>
        </header>
        <main>
            <aside className={styles.container}>
                <div className={styles.dashboard}>
                <div className={styles.dashboardHeader}>
                        <div className={styles.dashboardTitle}>
                            <span id="dashboardIcon">{activeProject === 'all' ? '📊' : (projects.find(p => p.code === activeProject)?.icon || '📊')}</span>
                            <span id="dashboardTitle">{activeProject === 'all' ? 'Общий дашборд всех проектов' : `Дашборд проекта ${projects.find(p => p.code === activeProject)?.icon || ''} ${projects.find(p => p.code === activeProject)?.name || ''}`}</span>
                        </div>
                        <div className={styles.dashboardActions}>
                            <select 
                                className={styles.formControl} 
                                id="sortBySelect"
                                value={currentSort}
                                onChange={(e) => setCurrentSort(e.target.value)}
                            >
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
                            <div className={styles.statNumber} id="totalWorks">{totalWorksCount}</div>
                            <div className={styles.statLabel}>Всего работ</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="visibleWorks">{visibleWorksCount}</div>
                            <div className={styles.statLabel}>Показано работ</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="completedWorks">{dashboardCompletedWorks}</div>
                            <div className={styles.statLabel}>Завершено</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="inProgressWorks">{dashboardInProgressWorks}</div>
                            <div className={styles.statLabel}>В процессе</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="overdueWorks">{dashboardOverdueWorks}</div>
                            <div className={styles.statLabel}>Просрочено</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statNumber} id="avgProgress">{dashboardAvgProgress}%</div>
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
                                {projects.map(project => {
                                    const projectWorksCount = works.filter(w => w.project === project.code).length;
                                    const isProjectSelected = selectedProject === project.code;

                                    return (
                                        <div key={project.code} className={`${styles.treeProject} ${isProjectSelected ? styles.active : ''}`} id={`tree-project-${project.code}`}>
                                            <div className={styles.treeProjectHeader} onClick={() => {
                                                setSelectedProject(isProjectSelected ? null : project.code);
                                                setSelectedBlock(null);
                                                setSelectedFloor(null);
                                            }}>
                                                <div className={styles.treeProjectName}>
                                                    {project.icon} {project.name}
                                                </div>
                                                <span>({projectWorksCount} работ)</span>
                                            </div>
                                            <div className={styles.treeBlocks}>
                                                {project.blocks.map(block => {
                                                    const blockWorksCount = works.filter(w => w.project === project.code && w.block === block.name).length;
                                                    const isBlockSelected = selectedBlock === block.name;
                                                    return (
                                                        <div key={block.name} className={`${styles.treeBlock} ${isBlockSelected ? styles.active : ''}`} id={`tree-block-${block.name}`}>
                                                            <div className={styles.treeBlockHeader} onClick={() => {
                                                                setSelectedProject(project.code);
                                                                setSelectedBlock(isBlockSelected ? null : block.name);
                                                                setSelectedFloor(null);
                                                            }}>
                                                                <span>🏢 {block.name}</span>
                                                                <span>({blockWorksCount})</span>
                                                            </div>
                                                            <div className={styles.treeFloors}>
                                                            {block.floors.map(floor => {
                                                                    const floorWorksCount = works.filter(w => w.project === project.code && w.block === block.name && w.floor === floor.number).length;
                                                                    const isFloorSelected = selectedFloor === floor.number;
                                                                    
                                                                    return (
                                                                        <div key={floor.id} className={`${styles.treeFloor} ${isFloorSelected ? styles.selected : ''}`} onClick={() => {
                                                                            setSelectedProject(project.code);
                                                                            setSelectedBlock(block.name);
                                                                            setSelectedFloor(isFloorSelected ? null : floor.number);
                                                                        }}>
                                                                            <span>📋 {floor.number}</span>
                                                                            <span>({floorWorksCount})</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={styles.sidebarSection}>
                            <div className={styles.sidebarTitle}>
                                🔧 Быстрые действия
                            </div>
                            <div className={styles.sidebarBtn}>
                                <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => setIsCreateWorkModalOpen(true)}>➕ Добавить работу</button>
                                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsProjectModalOpen(true)}>🏗️ Новый проект</button>
                                <button className={`${styles.btn} ${styles.btnWarning}`} onClick={handleSeedData}>📥 Загрузить демо данные</button>
                                <button className={`${styles.btn} ${styles.btnInfo}`}>📊 Создать отчет</button>
                            </div>
                        </div>
                    </div>

                    <div className={styles.contentArea}>
                        <div className={styles.contentHeader}>
                            <div className={styles.contentTitle} id="contentTitle">
                                {(() => {
                                    if (selectedProject && selectedBlock && selectedFloor) {
                                        const project = projects.find(p => p.code === selectedProject);
                                        return `📋 ${project?.name || ''} - ${selectedBlock} - ${selectedFloor} (${filteredAndSortedWorks.length} работ)`;
                                    } else if (selectedProject && selectedBlock) {
                                        const project = projects.find(p => p.code === selectedProject);
                                        return `🏢 ${project?.name || ''} - ${selectedBlock} (${filteredAndSortedWorks.length} работ)`;
                                    } else if (selectedProject) {
                                        const project = projects.find(p => p.code === selectedProject);
                                        return `🏗️ ${project?.name || ''} (${filteredAndSortedWorks.length} работ)`;
                                    } else if (activeProject !== 'all') {
                                        const project = projects.find(p => p.code === activeProject);
                                        return `🏗️ ${project?.name || ''} (${filteredAndSortedWorks.length} работ)`;
                                    } else {
                                        return `🌐 Все проекты (${filteredAndSortedWorks.length} работ)`;
                                    }
                                })()}
                            </div>
                            <div className={styles.contentActions}>
                                <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={() => setIsCreateWorkModalOpen(true)}>➕ Добавить работу</button>
                            </div>
                        </div>
                        
                        <div id="worksContainer">
                            {filteredAndSortedWorks.length === 0 ? (
                            <div className={styles.emptyState}>
                                
                                <div className={styles.emptyStateIcon}>🏗️</div>
                                    <h3>Добро пожаловать в систему управления строительными проектами</h3>
                                    <p>Создайте новый проект или выберите существующий для начала работы</p>
                                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setIsProjectModalOpen(true)}>🏗️ Создать первый проект</button>
                                </div>
                            ) : (
                                <div className={styles.worksGrid}>
                                    {filteredAndSortedWorks.map(work => {
                                        const workTypeInfo = workTypes.find(wt => wt.name === work.workType);
                                        const techOrderClass = `tech-order-${Math.min(work.techOrder || 1, 20)}`;
                                        const techOrderColor = workTypeInfo ? workTypeInfo.color : '#dee2e6';
                                        
                                        const getCategoryColor = (category) => {
                                            const colors = {
                                                'Черновые работы': '#e53e3e',
                                                'Отделочные работы': '#38a169',
                                                'Потолки': '#3182ce',
                                                'Конструкции': '#805ad5',
                                                'Напольные покрытия': '#ed8936',
                                                'Специальные работы': '#fd7900',
                                                'Завершающие работы': '#28a745'
                                            };
                                            return colors[category] || '#6c757d';
                                        };

                                        return (
                                            <div key={work.id} className={`${styles.workCard} ${techOrderClass}`}>
                                                <div className={styles.workHeader}>
                                                    <div className={styles.workTitle}>
                                                        {work.workType}
                                                        <span className={styles.techOrderBadge} style={{background: techOrderColor}}>
                                                            #{work.techOrder}
                                                        </span>
                                                        <span className={styles.categoryBadge} style={{background: getCategoryColor(work.category)}}>
                                                            {work.category?.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                    <div className={styles.workActions}>
                                                        <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} onClick={() => {
                                                            setEditingWork(work);
                                                            setIsEditWorkModalOpen(true);
                                                        }} title="Редактировать">✏️</button>
                                                        <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => removeWork(work.id)} title="Удалить">🗑️</button>
                                                    </div>
                                                </div>
                                                
                                                <div className={styles.workDetails}>
                                                    <div className={styles.workDetail}>
                                                        <span className={styles.workDetailLabel}>Проект:</span>
                                                        <span className={styles.workDetailValue}>{(projects.find(p => p.code === work.project)?.icon || '')} {projects.find(p => p.code === work.project)?.name || 'Неизвестный проект'}</span>
                                                    </div>
                                                    <div className={styles.workDetail}>
                                                        <span className={styles.workDetailLabel}>Блок/Этаж:</span>
                                                        <span className={styles.workDetailValue}>{work.block} - {work.floor}</span>
                                                    </div>
                                                    <div className={styles.workDetail}>
                                                        <span className={styles.workDetailLabel}>Объект:</span>
                                                        <span className={styles.workDetailValue}>{work.object}</span>
                                                    </div>
                                                    <div className={styles.workDetail}>
                                                        <span className={styles.workDetailLabel}>Исполнитель:</span>
                                                        <span className={styles.workDetailValue}>{work.executor}</span>
                                                    </div>
                                                    <div className={styles.workDetail}>
                                                        <span className={styles.workDetailLabel}>Период:</span>
                                                        <span className={styles.workDetailValue}>{formatDate(work.startDate)} - {formatDate(work.endDate)}</span>
                                                    </div>
                                                    <div className={styles.workDetail}>
                                                        <span className={styles.workDetailLabel}>Статус:</span>
                                                        <span className={styles.workDetailValue}>{getStatusText(work.status)}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className={styles.progressSection}>
                                                    <div className={styles.progressBar}>
                                                        <div className={styles.progressFill} style={{width: `${work.progress}%`}}></div>
                                                        <div className={styles.progressText}>{work.progress}% выполнено</div>
                                                    </div>
                                                </div>

                                                <div className={styles.statusControls}>
                                                    <button className={`${styles.statusBtn} ${styles.statusNotStarted} ${work.status === 'not-started' ? styles.active : ''}`} onClick={() => editWork(work.id, { ...work, status: 'not-started', progress: 0 })}>Не начато</button>
                                                    <button className={`${styles.statusBtn} ${styles.statusInProgress} ${work.status === 'in-progress' ? styles.active : ''}`} onClick={() => editWork(work.id, { ...work, status: 'in-progress', progress: work.progress || 25 })}>В процессе</button>
                                                    <button className={`${styles.statusBtn} ${styles.statusCompleted} ${work.status === 'completed' ? styles.active : ''}`} onClick={() => editWork(work.id, { ...work, status: 'completed', progress: 100 })}>Завершено</button>
                                                    <button className={`${styles.statusBtn} ${styles.statusOverdue} ${work.status === 'overdue' ? styles.active : ''}`} onClick={() => editWork(work.id, { ...work, status: 'overdue' })}>Просрочено</button>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
            {isProjectManagerOpen && (
            <ProjectManagerWindow 
                isOpen={isProjectManagerOpen} 
                onClose={() => setIsProjectManagerOpen(false)}
                projects={projects}
                works={works}
                onEditProject={(projectCode) => {
                    setEditingProject(projects.find(p => p.code === projectCode));
                    setIsProjectModalOpen(true);
                }}
                onDeleteProject={removeProject}
                onSelectProject={(projectCode) => setActiveProject(projectCode)}
                onAddNewProject={() => setIsProjectModalOpen(true)}
            />
        )}
        {isCreateWorkModalOpen && (
            <CreateWorkWindow
                isOpen={isCreateWorkModalOpen}
                onClose={() => setIsCreateWorkModalOpen(false)}
                projects={projects}
                workTypes={workTypes}
                executors={executors}
                addWork={addWork}
                showNotification={showNotification}
                fetchExecutors={fetchExecutors}
            />
        )}
        {isEditWorkModalOpen && editingWork && (
            <EditWindow
                isOpen={isEditWorkModalOpen}
                onClose={() => {
                    setIsEditWorkModalOpen(false);
                    setEditingWork(null);
                }}
                work={editingWork}
                projects={projects}
                workTypes={workTypes}
                executors={executors}
                editWork={editWork}
                showNotification={showNotification}
            />
        )}
        {isProjectModalOpen && (
            <CreateProjectWindow
                isOpen={isProjectModalOpen}
                onClose={() => {
                    setIsProjectModalOpen(false);
                    setEditingProject(null);
                }}
                project={editingProject}
                addProject={addProject}
                editProject={editProject}
                showNotification={showNotification}
            />
        )}
        </main>
    </section>
    );
}