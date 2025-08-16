import React from "react";

export default function WindowProjectManager (
    className = '',
    ...rest
) {
    <div id="projectManagerModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">⚙️ Управление проектами</h2>
                <span class="close" onclick="closeModal('projectManagerModal')">&times;</span>
            </div>
            
            <div style="display: grid; gap: 15px; max-width: 600px;">
                <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <button class="btn btn-success" onclick="addNewProject()">➕ Создать проект</button>
                    <button class="btn btn-warning" onclick="exportData()">📥 Экспорт данных</button>
                    <button class="btn btn-info" onclick="generateReport()">📊 Создать отчет</button>
                </div>
                
                <div id="projectsList">
                    {/* Список проектов будет добавлен динамически */} 
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                <button class="btn btn-primary" onclick="closeModal('projectManagerModal')">Закрыть</button>
            </div>
        </div>
    </div>
}