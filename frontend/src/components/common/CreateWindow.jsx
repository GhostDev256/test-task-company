import React, { useState } from "react";
import styles from '../../styles/common/CreateWindow.module.scss' 

export default function CreateWindow (
    className = '',
    ...rest
){
    return (
        <div id="projectModal" className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle} id="projectModalTitle">Создать новый проект</h2>
                    <span className={styles.close} onClick={() => closeModal('projectModal')}></span>
                </div>
                
                <form id="projectForm">
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Код проекта *</label>
                            <input type="text" className={styles.formControl} id="projectCode" placeholder="например: gulkevichi-1" required/>
                            <small className={styles.small}>Уникальный код для идентификации проекта</small>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Иконка проекта</label>
                            <select className={styles.formControl} id="projectIcon">
                                <option value="🏢">🏢 Офисное здание</option>
                                <option value="🏗️">🏗️ Строительство</option>
                                <option value="🏭">🏭 Промышленный объект</option>
                                <option value="🏠">🏠 Жилой дом</option>
                                <option value="🏫">🏫 Общественное здание</option>
                                <option value="🏥">🏥 Медицинское учреждение</option>
                                <option value="🏨">🏨 Гостиница</option>
                                <option value="🏪">🏪 Торговое здание</option>
                            </select>
                        </div>
                        
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.formLabel}>Название проекта *</label>
                            <input type="text" className={styles.formControl} id="projectName" placeholder="например: ЖК Гулькевичи" required/>
                        </div>
                        
                        <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                            <label className={styles.formLabel}>Описание проекта</label>
                            <textarea className={styles.formControl} id="projectDescription" rows="3" placeholder="Краткое описание проекта, его особенности и цели"></textarea>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Заказчик</label>
                            <input type="text" className={styles.formControl} id="projectClient" placeholder="Название организации заказчика"/>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Подрядчик</label>
                            <input type="text" className={styles.formControl} id="projectContractor" placeholder="Название организации подрядчика"/>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Адрес объекта</label>
                            <input type="text" className={styles.formControl} id="projectAddress" placeholder="Полный адрес строительного объекта"/>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Дата начала проекта</label>
                            <input type="date" className={styles.formControl} id="projectStartDate"/>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Дата окончания проекта</label>
                            <input type="date" className={styles.formControl} id="projectEndDate"/>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Бюджет проекта (руб.)</label>
                            <input type="number" className={styles.formControl} id="projectBudget" placeholder="0"/>
                        </div>
                    </div>
                    
                    <h3>🏢 Конструктор блоков</h3>
                    
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.formLabel}>Блоки проекта</label>
                        <div id="blocksContainer">
                            {/* Блоки будут добавлены динамически */}
                        </div>
                        <button type="button" className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSmall}`} onClick={addBlock}>➕ Добавить блок</button>
                        <small className={styles.smallForm}>Настройте блоки и этажность для каждого блока отдельно</small>
                    </div>
                    
                    <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                        <label className={styles.formLabel}>Объекты (помещения)</label>
                        <textarea className={styles.formControl} id="projectObjects" rows="3" placeholder="Квартиры, МОП, Лифт.холл, Лест. м., Электрощитовая, ВНС, Коммерция"></textarea>
                        <small className={styles.small}>Типы помещений/объектов через запятую</small>
                    </div>
                    
                    <div className={styles.bottomDiv}>
                        <button type="button" className={`${styles.btn} ${styles.btnDanger}`}>Отмена</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnSuccess}`}>Сохранить проект</button>
                    </div>
                </form>
            </div>
        </div>
    );
}