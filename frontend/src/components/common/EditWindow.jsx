import React, { useState, useEffect } from 'react';
import styles from '../../styles/common/EditWindow.module.scss';

export default function EditWindow({
    isOpen,
    onClose,
    work: initialWork,
    projects,
    workTypes,
    executors,
    editWork,
    showNotification
}) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen && initialWork) {
            const project = projects.find(p => p.code === initialWork.project);
            const block = project?.blocks.find(b => b.name === initialWork.block);
            const floor = block?.floors.find(f => f.number === initialWork.floor);
            const object = project?.objects.find(o => o.name === initialWork.object);
            const workType = workTypes.find(wt => wt.name === initialWork.workType);
            const executor = executors.find(e => e.name === initialWork.executor);
            
            setFormData({
                project: initialWork.project || '',
                block: initialWork.block || '',
                floor: floor?.id || '',
                object: object?.id || '',
                category: initialWork.category || '',
                workType: workType?.id || '',
                executor: executor?.id || '',
                startDate: initialWork.start_date || '', 
                endDate: initialWork.end_date || '',  
                progress: initialWork.progress || 0,
                status: initialWork.status || 'not-started',
                priority: initialWork.priority || 'medium',
                note: initialWork.note || ''
            });
        }
    }, [isOpen, initialWork, projects, workTypes, executors]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getFilteredWorkTypes = (category) => {
        if (!category) return workTypes;
        return workTypes.filter(wt => wt.category === category);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const updatedWorkData = {
            executor_id: parseInt(formData.executor),
            work_type_id: parseInt(formData.workType),
            start_date: formData.startDate,
            end_date: formData.endDate,
            status: formData.status,
            priority: formData.priority,
            progress: parseInt(formData.progress),
            note: formData.note,
            floor_id: parseInt(formData.floor),
            object_id: parseInt(formData.object),
        };

        if (Object.values(updatedWorkData).some(val => val === null || val === undefined || isNaN(val) && typeof val !== 'string')) {
             if (!updatedWorkData.note) { // Примечание может быть пустым
                showNotification('Пожалуйста, заполните все обязательные поля.', 'error');
                return;
             }
        }
        
        if (new Date(updatedWorkData.start_date) > new Date(updatedWorkData.end_date)) {
            showNotification('Дата начала не может быть позже даты окончания.', 'error');
            return;
        }

        try {
            await editWork(initialWork.id, updatedWorkData);
            showNotification('Работа успешно обновлена!', 'success');
            onClose();
        } catch (error) {
            showNotification(`Ошибка: ${error.message}`, 'error');
            console.error('Ошибка обновления работы:', error);
        }
    };

    const currentProject = projects.find(p => p.code === formData.project);
    const currentBlock = currentProject?.blocks?.find(b => b.name === formData.block);
    const availableFloors = currentBlock?.floors || [];
    const availableObjects = currentProject?.objects || [];
    const availableWorkTypes = getFilteredWorkTypes(formData.category);

    if (!isOpen) return null;

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>Редактировать работу</h2>
                    <span className={styles.close} onClick={onClose}>&times;</span>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        {/* Поля Проект и Блок без изменений в JSX */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Проект</label>
                            <select className={styles.formControl} name="project" value={formData.project || ''} onChange={handleChange} required>
                                {projects.map(p => <option key={p.code} value={p.code}>{p.icon} {p.name}</option>)}
                            </select>
                        </div>
                        
                        {/* --- ИЗМЕНЕНИЕ 4: Обновленный рендеринг списков --- */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Блок</label>
                            <select className={styles.formControl} name="block" value={formData.block || ''} onChange={handleChange} required>
                                <option value="">Выберите блок</option>
                                {currentProject?.blocks?.map(block => (
                                    <option key={block.id} value={block.name}>{block.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Этаж</label>
                            <select className={styles.formControl} name="floor" value={formData.floor || ''} onChange={handleChange} required>
                                <option value="">Выберите этаж</option>
                                {availableFloors.map(floor => (
                                    <option key={floor.id} value={floor.id}>{floor.number}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Объект</label>
                            <select className={styles.formControl} name="object" value={formData.object || ''} onChange={handleChange} required>
                                <option value="">Выберите объект</option>
                                {availableObjects.map(obj => (
                                    <option key={obj.id} value={obj.id}>{obj.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Категория работ</label>
                            <select className={styles.formControl} name="category" value={formData.category || ''} onChange={handleChange}>
                                <option value="">Все категории</option>
                                {[...new Set(workTypes.map(wt => wt.category))].map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Вид работы</label>
                            <select className={styles.formControl} name="workType" value={formData.workType || ''} onChange={handleChange} required>
                                <option value="">Выберите вид работы</option>
                                {availableWorkTypes.map(wt => (
                                    <option key={wt.id} value={wt.id}>{wt.name} (#{wt.order})</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Исполнитель</label>
                            <select className={styles.formControl} name="executor" value={formData.executor || ''} onChange={handleChange} required>
                                <option value="">Выберите исполнителя</option>
                                {executors.map(exec => (
                                    <option key={exec.id} value={exec.id}>{exec.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Остальные поля без изменений */}
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Дата начала</label>
                            <input type="date" className={styles.formControl} name="startDate" value={formData.startDate || ''} onChange={handleChange} required />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Дата окончания</label>
                            <input type="date" className={styles.formControl} name="endDate" value={formData.endDate || ''} onChange={handleChange} required />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Статус</label>
                            <select className={styles.formControl} name="status" value={formData.status || 'not-started'} onChange={handleChange} required>
                                <option value="not-started">Не начато</option>
                                <option value="in-progress">В процессе</option>
                                <option value="completed">Завершено</option>
                                <option value="overdue">Просрочено</option>
                            </select>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Приоритет</label>
                            <select className={styles.formControl} name="priority" value={formData.priority || 'medium'} onChange={handleChange}>
                                <option value="low">Низкий</option>
                                <option value="medium">Средний</option>
                                <option value="high">Высокий</option>
                            </select>
                        </div>
                        
                        <div className={styles.formGroupFullWidth}>
                            <label className={styles.formLabel}>Прогресс: <span>{formData.progress || 0}</span>%</label>
                            <input type="range" className={styles.formControl} name="progress" min="0" max="100" value={formData.progress || 0} onChange={handleChange} style={{height: '10px'}} />
                        </div>

                        <div className={styles.formGroupFullWidth}>
                            <label className={styles.formLabel}>Примечания</label>
                            <textarea className={styles.formControl} name="notes" rows="3" value={formData.note || ''} onChange={handleChange}></textarea>
                        </div>
                    </div>
                    
                    <div className={styles.modalFooter}>
                        <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={onClose}>Отмена</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnSuccess}`}>Сохранить</button>
                    </div>
                </form>
            </div>
        </div>
    );
}