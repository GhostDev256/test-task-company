import React, { useState, useEffect } from 'react';
import styles from '../../styles/common/CreateWindow.module.scss'; 
import { createExecutor, getExecutors } from '../../../api/index.js'; 

export default function CreateWorkWindow({
    isOpen,
    onClose,
    projects,
    workTypes,
    executors,
    addWork,
    showNotification,
    fetchExecutors 
}) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        if (isOpen) {
            const defaultProjectCode = projects.length > 0 ? projects[0].code : '';
            const defaultProject = projects.find(p => p.code === defaultProjectCode);
            const defaultBlock = defaultProject?.blocks?.[0] || null;
            const defaultFloorId = defaultBlock?.floors?.[0]?.id || '';
            const defaultObjectId = defaultProject?.objects?.[0]?.id || '';

            setFormData({
                project: defaultProjectCode,
                block: defaultBlock?.name || '',
                floor: defaultFloorId,
                object: defaultObjectId,
                category: '',
                workType: '',
                executor: '',
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0],
                progress: 0,
                status: 'not-started',
                priority: 'medium',
                notes: ''
            });
        }
    }, [isOpen, projects]);

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
        
        try {
            const workTypeInfo = workTypes.find(wt => wt.id === parseInt(formData.workType));

            async function executorsLength() {
                const executors = await getExecutors();
                return executors.length;
            }

            let executorInfo = executors.find(e => e.name === formData.executor);
            if (!executorInfo) {
                try {
                    const newExecutor = await createExecutor({id: executorsLength()+1, name: formData.executor });
                    executorInfo = newExecutor;
                    showNotification(`Создан новый исполнитель: ${newExecutor.name}`, 'info');
                    await fetchExecutors();
                } catch (error) {
                    showNotification('Ошибка при создании нового исполнителя.', 'error');
                    return;
                }
            }
            
            const workData = {
                executor_id: executorInfo.id,
                work_type_id: workTypeInfo.id,
                start_date: formData.startDate,
                end_date: formData.endDate,
                status: formData.status,
                priority: formData.priority,
                progress: formData.progress,
                note: formData.notes,
                floor_id: parseInt(formData.floor), 
                object_id: parseInt(formData.object)
            };
            console.log('Отправляемые данные:', workData);

            await addWork(workData);
            showNotification('Работа успешно сохранена!', 'success');
            onClose();

        } catch (error) {
            console.error('Work save error:', error);
            showNotification(`Ошибка сохранения работы: ${error.message || 'Проверьте консоль'}`, 'error');
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
                    <h2 className={styles.modalTitle}>Добавить работу</h2>
                    <span className={styles.close} onClick={onClose}>&times;</span>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Проект</label>
                            <select className={styles.formControl} name="project" value={formData.project || ''} onChange={handleChange} required>
                                <option  value="">Выберите проект</option>
                                {projects.map(p => <option key={p.code} value={p.code}>{p.icon} {p.name}</option>)}
                            </select>
                        </div>
                        
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
                                <option key="all-categories" value="">Все категории</option>
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
                            <input
                                type="text"
                                className={styles.formControl}
                                name="executor"
                                value={formData.executor || ''}
                                onChange={handleChange}
                                list="executors-list"
                                required
                            />
                            <datalist id="executors-list">
                                {executors.map(e => <option key={e.id} value={e.name} />)}
                            </datalist>
                        </div>
                        
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
                            <textarea className={styles.formControl} name="notes" rows="3" value={formData.notes || ''} onChange={handleChange}></textarea>
                        </div>
                    </div>
                    
                    <div className={styles.modalFooter}>
                        <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={onClose}>Отмена</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnSuccess}`}>Сохранить работу</button>
                    </div>
                </form>
            </div>
        </div>
    );
}