import React, { useState } from "react";
import styles from '../../styles/common/ProjectManagerWindow.module.scss'

export default function CreateWindow (
    className = '',
    ...rest
){
    return (
        <div id="projectManagerModal" className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>⚙️ Управление проектами</h2>
                    <span className={styles.close} onClick={() => closeModal('projectManagerModal')}></span>
                </div>
                
                <div className={styles.formDiv}>
                    <div>
                        <button className={`${styles.btn} ${styles.btnSuccess}`} onClick={addNewProject}>➕ Создать проект</button>
                        <button className={`${styles.btn} ${styles.btnWarning}`} onClick={exportData}>📥 Экспорт данных</button>
                        <button className={`${styles.btn} ${styles.btnInfo}`} onClick={generateReport}>📊 Создать отчет</button>
                    </div>
                    
                    <div id="projectsList">
                        {/* Список проектов будет добавлен динамически */}
                    </div>
                </div>
                
                <div className={styles.bottomDiv}>
                    <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => closeModal('projectManagerModal')}>Закрыть</button>
                </div>
            </div>
        </div>
    );
}