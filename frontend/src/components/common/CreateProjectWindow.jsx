import React, { useState, useEffect } from 'react';
import styles from '../../styles/common/CreateWindow.module.scss';

export default function CreateProjectWindow({
    isOpen,
    onClose,
    project: initialProject,
    addProject,
    editProject,
    showNotification
}) {
    const [formData, setFormData] = useState({});
    const [blocks, setBlocks] = useState([]);
    const [objects, setObjects] = useState([]);

    useEffect(() => {
        if (isOpen) {
            if (initialProject) {
                setFormData({
                    code: initialProject.code || '',
                    icon: initialProject.icon || '🏢',
                    name: initialProject.name || '',
                    description: initialProject.description || '',
                    client: initialProject.client || '',
                    contractor: initialProject.contractor || '',
                    address: initialProject.address || '',
                    startDate: initialProject.start_date || '',
                    endDate: initialProject.end_date || '',
                    budget: initialProject.budget || ''
                });

                const loadedBlocks = (initialProject.blocks || []).map(block => {
                    const floors = block.floors;
                    const numericFloors = floors.filter(f => !isNaN(parseInt(f))).map(f => parseInt(f)).sort((a,b) => a-b);
                    const extraFloors = floors.filter(f => isNaN(parseInt(f)));
                    return {
                        name: block.name,
                        floorFrom: numericFloors.length > 0 ? numericFloors[0].toString() : '',
                        floorTo: numericFloors.length > 0 ? numericFloors[numericFloors.length - 1].toString() : '',
                        floorExtra: extraFloors.join(', ')
                    };
                });
                setBlocks(loadedBlocks.length > 0 ? loadedBlocks : [{ name: '', floorFrom: '', floorTo: '', floorExtra: '' }]);
                
                setObjects(initialProject.objects || []);
                
            } else {
                setFormData({
                    code: '',
                    icon: '🏢',
                    name: '',
                    description: '',
                    client: '',
                    contractor: '',
                    address: '',
                    startDate: '',
                    endDate: '',
                    budget: '',
                });
                setBlocks([{ name: 'БС-1', floorFrom: '1', floorTo: '9', floorExtra: '' }]);
                setObjects(["ВНС", "Квартиры", "Коммерция", "Лест. м.", "Лифт.холл", "МОП", "Электрощитовая"]);
            }
        }
    }, [isOpen, initialProject]);

    const handleObjectChange = (e) => {
        const value = e.target.value;
        setObjects(value.split(',').map(o => o.trim()));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlockChange = (index, field, value) => {
        const newBlocks = [...blocks];
        newBlocks[index][field] = value;
        setBlocks(newBlocks);
    };

    const addBlock = () => {
        setBlocks(prev => [...prev, { name: `БС-${prev.length + 1}`, floorFrom: '', floorTo: '', floorExtra: '' }]);
    };

    const removeBlock = (index) => {
        if (blocks.length > 1) {
            setBlocks(prev => prev.filter((_, i) => i !== index));
        } else {
            showNotification('Должен остаться хотя бы один блок', 'warning');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const projectBlocks = blocks.map(block => {
            const floors = [];
            if (block.floorExtra) {
                block.floorExtra.split(',').forEach(f => {
                    const trimmed = f.trim();
                    if (trimmed) floors.push(trimmed);
                });
            }
            const from = parseInt(block.floorFrom);
            const to = parseInt(block.floorTo);
            if (!isNaN(from) && !isNaN(to) && from <= to) {
                for (let i = from; i <= to; i++) {
                    floors.push(i.toString());
                }
            }
            return {
                name: block.name,
                floors: floors
            };
        }).filter(block => block.name);
    
        const projectData = {
            code: formData.code,
            icon: formData.icon,
            name: formData.name,
            description: formData.description,
            client: formData.client,
            contractor: formData.contractor,
            address: formData.address,
            start_date: formData.startDate || null,
            end_date: formData.endDate || null,
            budget: formData.budget ? parseFloat(formData.budget) : 0,
            blocks: projectBlocks,
            objects: objects.filter(o => o),
        };
    
        try {
            if (initialProject) {
                await editProject(initialProject.code, projectData);
                showNotification('Project updated successfully!', 'success');
            } else {
                await addProject(projectData);
                showNotification('Project created successfully!', 'success');
            }
            onClose();
        } catch (error) {
            showNotification(`Error: ${error.message}`, 'error');
            console.error('Project save error:', error);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2 className={styles.modalTitle}>{initialProject ? 'Редактировать проект' : 'Создать новый проект'}</h2>
                    <span className={styles.close} onClick={onClose}>&times;</span>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Код проекта *</label>
                            <input type="text" className={styles.formControl} name="code" value={formData.code || ''} onChange={handleChange} placeholder="например: gulkevichi-1" required />
                            <small>Уникальный код для идентификации проекта</small>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Иконка проекта</label>
                            <select className={styles.formControl} name="icon" value={formData.icon || '🏢'} onChange={handleChange}>
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
                        
                        <div className={styles.formGroupFullWidth}>
                            <label className={styles.formLabel}>Название проекта *</label>
                            <input type="text" className={styles.formControl} name="name" value={formData.name || ''} onChange={handleChange} placeholder="например: ЖК Гулькевичи" required />
                        </div>
                        
                        <div className={styles.formGroupFullWidth}>
                            <label className={styles.formLabel}>Описание проекта</label>
                            <textarea className={styles.formControl} name="description" rows="3" value={formData.description || ''} onChange={handleChange} placeholder="Краткое описание проекта, его особенности и цели"></textarea>
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Заказчик</label>
                            <input type="text" className={styles.formControl} name="client" value={formData.client || ''} onChange={handleChange} placeholder="Название организации заказчика" />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Подрядчик</label>
                            <input type="text" className={styles.formControl} name="contractor" value={formData.contractor || ''} onChange={handleChange} placeholder="Название организации подрядчика" />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Адрес объекта</label>
                            <input type="text" className={styles.formControl} name="address" value={formData.address || ''} onChange={handleChange} placeholder="Полный адрес строительного объекта" />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Дата начала проекта</label>
                            <input type="date" className={styles.formControl} name="startDate" value={formData.startDate || ''} onChange={handleChange} />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Дата окончания проекта</label>
                            <input type="date" className={styles.formControl} name="endDate" value={formData.endDate || ''} onChange={handleChange} />
                        </div>
                        
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Бюджет проекта (руб.)</label>
                            <input type="number" className={styles.formControl} name="budget" value={formData.budget || ''} onChange={handleChange} placeholder="0" />
                        </div>
                        
                        <h3 className={styles.h3}>🏢 Конструктор блоков</h3>
                        
                        <div className={styles.formGroupFullWidth}>
                            <label className={styles.formLabel}>Блоки проекта</label>
                            <div id="blocksContainer">
                                {blocks.map((block, index) => (
                                    <div key={index} className={styles.blockConstructor}>
                                        <div className={styles.blockHeader}>
                                            <input type="text" className={`${styles.formControl} ${styles.blockName}`} placeholder={`Название блока (например: БС-${index + 1})`} value={block.name} onChange={(e) => handleBlockChange(index, 'name', e.target.value)} style={{flex: 1, marginRight: '10px'}} />
                                            <button type="button" className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`} onClick={() => removeBlock(index)}>🗑️</button>
                                        </div>
                                        <div className={styles.floorRange}>
                                            <label>От этажа:</label>
                                            <input type="text" className={`${styles.formControl} ${styles.floorFrom}`} placeholder="1" value={block.floorFrom} onChange={(e) => handleBlockChange(index, 'floorFrom', e.target.value)} />
                                            <label>До этажа:</label>
                                            <input type="text" className={`${styles.formControl} ${styles.floorTo}`} placeholder="9" value={block.floorTo} onChange={(e) => handleBlockChange(index, 'floorTo', e.target.value)} />
                                            <label>Дополнительные:</label>
                                            <input type="text" className={`${styles.formControl} ${styles.floorExtra}`} placeholder="Подвал, Тех.этаж" value={block.floorExtra} onChange={(e) => handleBlockChange(index, 'floorExtra', e.target.value)} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className={`${styles.btn} ${styles.btnSuccess} ${styles.btnSmall}`} onClick={addBlock}>➕ Добавить блок</button>
                            <small className={styles.smallText}>Настройте блоки и этажность для каждого блока отдельно</small>
                        </div>
                        
                        <div className={styles.formGroupFullWidth}>
                            <label className={styles.formLabel}>Объекты (помещения)</label>
                            <textarea className={styles.formControl} name="objects" rows="3" value={objects.join(', ')} onChange={handleObjectChange} placeholder="Квартиры, МОП, Лифт.холл, Лест. м., Электрощитовая, ВНС, Коммерция"></textarea>
                            <small className={styles.smallText}>Типы помещений/объектов через запятую</small>
                        </div>
                    </div>
                    
                    <div className={styles.modalFooter}>
                        <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={onClose}>Отмена</button>
                        <button type="submit" className={`${styles.btn} ${styles.btnSuccess}`}>
                            {initialProject ? 'Сохранить изменения' : 'Создать проект'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
