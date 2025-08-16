import React, { useState } from "react";
import styles from '../../styles/common/EditWindow.module.scss'

export default function EditWindow (
    className = '',
    ...rest
){
    return (
        <div id="editModal" className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle} id="modalTitle">Редактировать работу</h2>
                    <span className={styles.close}>&times;</span>
                </div>
                
                <form id="workForm">
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Проект</label>
                            <select className={styles.formControl} id="editProject" required onChange={updateProjectFields}></select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Блок</label>
                            <select className={styles.formControl} id="editBlock" required onChange={updateFloorOptions}></select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Этаж</label>
                            <select className={styles.formControl} id="editFloor" required></select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Объект</label>
                            <select className={styles.formControl} id="editObject" required></select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Категория работ</label>
                            <select className={styles.formControl} id="editCategory" onChange={updateWorkTypeOptions}>
                                <option value="">Все категории</option>
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Вид работы</label>
                            <select className={styles.formControl} id="editWorkType" required></select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Исполнитель</label>
                            <input type="text" className={styles.formControl} id="editExecutor" required/>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Дата начала</label>
                            <input type="date" className={styles.formControl} id="editStartDate" required/>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Дата окончания</label>
                            <input type="date" className={styles.formControl} id="editEndDate" required/>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Статус</label>
                            <select className={styles.formControl} id="editStatus" required>
                                <option value="not-started">Не начато</option>
                                <option value="in-progress">В процессе</option>
                                <option value="completed">Завершено</option>
                                <option value="overdue">Просрочено</option>
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Приоритет</label>
                            <select className={styles.formControl} id="editPriority">
                                <option value="low">Низкий</option>
                                <option value="medium">Средний</option>
                                <option value="high">Высокий</option>
                            </select>
                        </div>
                        
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.formLabel}>Прогресс: <span id="progressValue">0</span>%</label>
                            <input type="range" className={`${styles.formControl} ${style.inputForm}`} id="editProgress" min="0" max="100" value="0"/>
                        </div>

                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.formLabel}>Примечания</label>
                            <textarea className={styles.formControl} id="editNotes" rows="3"></textarea>
                        </div>
                    </div>
                    
                    <div className={styles.bottomDiv}>
                        <button type="button" className="btn btn-danger">Отмена</button>
                        <button type="submit" className="btn btn-success">Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
}