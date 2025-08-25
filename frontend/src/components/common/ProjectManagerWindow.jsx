import React from 'react';
import styles from '../../styles/common/ProjectManagerWindow.module.scss';

export default function ProjectManagerWindow({ isOpen, onClose, projects, works, onEditProject, onDeleteProject, onSelectProject, onAddNewProject }) {
    if (!isOpen) return null;

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>⚙️ Управление проектами</h2>
                    <span className={styles.close} onClick={onClose}>&times;</span>
                </div>
                
                <div className={styles.projectManagerGrid}>
                    <div className={styles.projectManagerActions}>
                        <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={onAddNewProject}>➕ Создать проект</button>
                    </div>
                    
                    <div className={styles.projectsList}>
                        {projects.length === 0 ? (
                            <div className={styles.emptyState}>
                                <h3>Нет проектов</h3>
                                <p>Создайте свой первый проект для начала работы.</p>
                            </div>
                        ) : (
                            projects.map(project => {
                                const projectWorks = works.filter(w => w.project === project.code);
                                const totalBlocks = Object.keys(project.blocks || {}).length;
                                const totalFloors = Object.values(project.blocks || {}).reduce((sum, block) => sum + block.floors.length, 0);
                                const completedWorks = projectWorks.filter(w => w.status === 'completed').length;
                                const avgProgress = projectWorks.length > 0 
                                    ? Math.round(projectWorks.reduce((sum, w) => sum + w.progress, 0) / projectWorks.length)
                                    : 0;

                                return (
                                    <div key={project.code} className={styles.projectCard}>
                                        <div className={styles.projectCardHeader}>
                                            <div>
                                                <h3>{project.icon} {project.name}</h3>
                                                <p className={styles.projectCardDescription}>{project.description || 'Описание не указано'}</p>
                                                <small className={styles.projectCardAddress}>{project.address || 'Адрес не указан'}</small>
                                            </div>
                                            <div className={styles.projectCardActions}>
                                                <button className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`} onClick={() => {
                                                    onSelectProject(project.code);
                                                    onClose();
                                                }}>👁️ Открыть</button>
                                                <button className={`${styles.btn} ${styles.btnWarning} ${styles.btnSmall}`} onClick={() => onEditProject(project.code)}>✏️ Редактировать</button>
                                                <button className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => onDeleteProject(project.code)}>🗑️ Удалить</button>
                                            </div>
                                        </div>
                                        <div className={styles.projectCardStats}>
                                            <div className={styles.statItem}>
                                                <div className={styles.statNumber}>{totalBlocks}</div>
                                                <div className={styles.statLabel}>Блоков</div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statNumber}>{totalFloors}</div>
                                                <div className={styles.statLabel}>Этажей</div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statNumber}>{projectWorks.length}</div>
                                                <div className={styles.statLabel}>Работ</div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statNumber}>{completedWorks}</div>
                                                <div className={styles.statLabel}>Завершено</div>
                                            </div>
                                            <div className={styles.statItem}>
                                                <div className={styles.statNumber}>{avgProgress}%</div>
                                                <div className={styles.statLabel}>Прогресс</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
                
                <div className={styles.modalFooter}>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
}