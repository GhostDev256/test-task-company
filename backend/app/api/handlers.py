from app.api.forms import *
from app.models.user_model import User
from app.models.project_model import Project
from app.models.block_model import Block
from app.models.floor_model import Floor
from app.models.object_model import Object
from app.models.work_model import Work
from app.models.work_type_model import WorkType
from app.models.executor_model import Executor
from app import db
from flask import jsonify, request, abort
from . import api_bp
from datetime import datetime, timedelta, date
from typing import List
import random

def to_dict(instance):
    if not instance:
        return None
    
    result = {}
    for column in instance.__table__.columns:
        value = getattr(instance, column.name)
        if isinstance(value, (datetime, date)):
            result[column.name] = value.isoformat().split('T')[0]
        else:
            result[column.name] = value
    
    if hasattr(instance, 'blocks'):
        blocks_list = []
        for block in sorted(instance.blocks, key=lambda b: b.name):
            floors = sorted(
                [{'id': floor.id, 'number': floor.number} for floor in block.floors], 
                key=lambda f: str(f['number'])
            )
            blocks_list.append({'id': block.id, 'name': block.name, 'floors': floors})
        result['blocks'] = blocks_list

    if hasattr(instance, 'objects'):
        result['objects'] = sorted(
            [{'id': obj.id, 'name': obj.name} for obj in instance.objects],
            key=lambda o: o['name']
        )

    if isinstance(instance, Work):
        result['project'] = instance.floor.block.project.code if instance.floor and instance.floor.block and instance.floor.block.project else None
        result['block'] = instance.floor.block.name if instance.floor and instance.floor.block else None
        result['floor'] = instance.floor.number if instance.floor else None
        result['object'] = instance.object.name if instance.object else None
        result['workType'] = instance.work_type_rel.name if instance.work_type_rel else None
        result['executor'] = instance.executor_rel.name if instance.executor_rel else None
        result['techOrder'] = instance.work_type_rel.order if instance.work_type_rel else None
        result['category'] = instance.work_type_rel.category if instance.work_type_rel else None

    return result


@api_bp.route('/ping', methods=['GET'])
def ping():
    return 'Я живой!'


@api_bp.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify([to_dict(p) for p in projects])


@api_bp.route('/projects/<string:code>', methods=['GET'])
def get_project(code):
    project = Project.query.filter_by(code=code).first_or_404()
    return jsonify(to_dict(project))


@api_bp.route('/projects', methods=['POST'])
def create_project():
    data = request.json or {}
    form = ProjectForm(data=data)

    if not form.validate():
        return jsonify(form.errors), 400

    if Project.query.filter_by(code=form.code.data).first():
        return jsonify({'error': 'Project with this code already exists'}), 400
    
    start_date_obj = None
    if form.start_date.data:
        start_date_obj = datetime.strptime(str(form.start_date.data), '%Y-%m-%d').date()

    end_date_obj = None
    if form.end_date.data:
        end_date_obj = datetime.strptime(str(form.end_date.data), '%Y-%m-%d').date()

    project = Project(
        code=form.code.data,
        icon=form.icon.data,
        name=form.name.data,
        description=form.description.data,
        client=form.client.data,
        contractor=form.contractor.data,
        address=form.address.data,
        start_date=start_date_obj,
        end_date=end_date_obj,
        budget=form.budget.data
    )
    db.session.add(project)

    blocks_data = data.get('blocks', [])
    if isinstance(blocks_data, list):
        for block_data in blocks_data:
            if isinstance(block_data, dict):
                block_name = block_data.get('name')
                if not block_name:
                    continue
                
                block = Block(name=block_name, project=project)
                db.session.add(block)
                db.session.flush() 

                floors = block_data.get('floors', [])
                if isinstance(floors, list):
                    for floor_number in floors:
                        floor = Floor(number=str(floor_number), block=block)
                        db.session.add(floor)

    objects_data = data.get('objects', [])
    if isinstance(objects_data, list):
        for obj_name in objects_data:
            if obj_name:
                obj = Object(name=str(obj_name), project=project)
                db.session.add(obj)

    db.session.commit()
    return jsonify(to_dict(project)), 201


@api_bp.route('/projects/<string:code>', methods=['PUT'])
def update_project(code):
    project = Project.query.filter_by(code=code).first_or_404()
    data = request.json or {}
    form = ProjectForm(data=data)

    if form.validate():
        if form.code.data != project.code and Project.query.filter_by(code=form.code.data).first():
            return jsonify({'error': 'Project with this code already exists'}), 400

        project.code = form.code.data
        project.icon = form.icon.data
        project.name = form.name.data
        project.description = form.description.data
        project.client = form.client.data
        project.contractor = form.contractor.data
        project.address = form.address.data
        
        start_date_str = data.get('start_date')
        end_date_str = data.get('end_date')
        
        project.start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date() if start_date_str else None
        project.end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date() if end_date_str else None
        
        project.budget = form.budget.data

        new_blocks_data = data.get('blocks', [])
        existing_block_names = {block.name for block in project.blocks}
        new_block_names = {block_data['name'] for block_data in new_blocks_data}
        
        blocks_to_delete = [b for b in project.blocks if b.name not in new_block_names]
        for block in blocks_to_delete:
            db.session.delete(block)
        
        for block_data in new_blocks_data:
            block_name = block_data['name']
            if block_name in existing_block_names:
                block = next(b for b in project.blocks if b.name == block_name)
                existing_floor_numbers = {f.number for f in block.floors}
                new_floor_numbers = {str(fn) for fn in block_data.get('floors', [])}

                floors_to_delete = [f for f in block.floors if f.number not in new_floor_numbers]
                for floor in floors_to_delete:
                    db.session.delete(floor)
                
                floors_to_add = new_floor_numbers - existing_floor_numbers
                for floor_number in floors_to_add:
                    floor = Floor(number=str(floor_number), block=block)
                    db.session.add(floor)
            else:
                block = Block(name=block_name, project=project)
                db.session.add(block)
                db.session.flush()
                for floor_number in block_data.get('floors', []):
                    floor = Floor(number=str(floor_number), block=block)
                    db.session.add(floor)

        new_objects_data = data.get('objects', [])
        existing_object_names = {obj.name for obj in project.objects}
        new_object_names = set(new_objects_data)

        objects_to_delete = [obj for obj in project.objects if obj.name not in new_object_names]
        for obj in objects_to_delete:
            db.session.delete(obj)

        objects_to_add = new_object_names - existing_object_names
        for obj_name in objects_to_add:
            obj = Object(name=str(obj_name), project=project)
            db.session.add(obj)

        db.session.commit()
        return jsonify(to_dict(project))
    return jsonify(form.errors), 400


@api_bp.route('/projects/<string:code>', methods=['DELETE'])
def delete_project(code):
    project = Project.query.filter_by(code=code).first_or_404()
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted'}), 204


@api_bp.route('/works', methods=['GET'])
def get_works():
    works = Work.query.all()
    return jsonify([to_dict(w) for w in works])


@api_bp.route('/works/<int:id>', methods=['GET'])
def get_work(id):
    work = Work.query.get_or_404(id)
    return jsonify(to_dict(work))


@api_bp.route('/works', methods=['POST'])
def create_work():
    data = request.json or {}
    form = WorkForm(data=data)

    if form.validate():
        work = Work(
            executor_id=form.executor_id.data,
            work_type_id=form.work_type_id.data,
            start_date=datetime.strptime(data['start_date'], '%Y-%m-%d').date(),
            end_date=datetime.strptime(data['end_date'], '%Y-%m-%d').date(),
            status=form.status.data,
            priority=form.priority.data,
            progress=form.progress.data,
            note=form.note.data,
            floor_id=form.floor_id.data,
            object_id=form.object_id.data
        )
        db.session.add(work)
        db.session.commit()
        return jsonify(to_dict(work)), 201
    
    return jsonify(form.errors), 400


@api_bp.route('/works/<int:id>', methods=['PUT'])
def update_work(id):
    work = Work.query.get_or_404(id)
    data = request.json or {}
    form = WorkForm(data=data)
    
    if form.validate():
        work.executor_id = form.executor_id.data
        work.work_type_id = form.work_type_id.data
        work.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        work.end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        work.status = form.status.data
        work.priority = form.priority.data
        work.progress = form.progress.data
        work.note = form.note.data
        work.floor_id = form.floor_id.data
        work.object_id = form.object_id.data
        db.session.commit()
        return jsonify(to_dict(work))
    return jsonify(form.errors), 400


@api_bp.route('/works/<int:id>', methods=['DELETE'])
def delete_work(id):
    work = Work.query.get_or_404(id)
    db.session.delete(work)
    db.session.commit()
    return jsonify({'message': 'Work deleted'}), 204


@api_bp.route('/work_types', methods=['GET'])
def get_work_types():
    work_types = WorkType.query.all()
    return jsonify([to_dict(wt) for wt in work_types])


@api_bp.route('/work_types', methods=['POST'])
def create_work_type():
    data = request.json or {}
    form = WorkTypeForm(data=data)
    if form.validate():
        work_type = WorkType(
            name=form.name.data,
            order=form.order.data,
            color=form.color.data,
            category=form.category.data
        )
        db.session.add(work_type)
        db.session.commit()
        return jsonify(to_dict(work_type)), 201
    return jsonify(form.errors), 400


@api_bp.route('/executors', methods=['GET'])
def get_executors():
    executors = Executor.query.all()
    return jsonify([to_dict(e) for e in executors])


@api_bp.route('/executors', methods=['POST'])
def create_executor():
    data = request.json or {}
    form = ExecutorForm(data=data)
    if form.validate():
        executor = Executor(
            name=form.name.data
        )
        db.session.add(executor)
        db.session.commit()
        return jsonify(to_dict(executor)), 201
    return jsonify(form.errors), 400


@api_bp.route('/seed_data', methods=['POST'])
def seed_data():
    db.session.query(Work).delete()
    db.session.query(Floor).delete()
    db.session.query(Block).delete()
    db.session.query(Object).delete()
    db.session.query(WorkType).delete()
    db.session.query(Executor).delete()
    db.session.query(Project).delete()
    db.session.commit()

    work_types_data = [
        {"name": "Штукатурка", "order": 1, "color": "#e53e3e", "category": "Черновые работы"},
        {"name": "Стяжка", "order": 2, "color": "#fd7900", "category": "Черновые работы"},
        {"name": "Утеплитель", "order": 3, "color": "#fbb917", "category": "Черновые работы"},
        {"name": "Шпаклёвка", "order": 4, "color": "#38a169", "category": "Отделочные работы"},
        {"name": "Шпатлёвка", "order": 4, "color": "#38a169", "category": "Отделочные работы"},
        {"name": "Плитка", "order": 5, "color": "#3182ce", "category": "Отделочные работы"},
        {"name": "Сапожок", "order": 6, "color": "#805ad5", "category": "Отделочные работы"},
        {"name": "ГКЛ", "order": 7, "color": "#9c88ff", "category": "Конструкции"},
        {"name": "Армстронг", "order": 8, "color": "#48bb78", "category": "Потолки"},
        {"name": "Грильято", "order": 9, "color": "#ed8936", "category": "Потолки"},
        {"name": "Кварц винил", "order": 10, "color": "#38b2ac", "category": "Напольные покрытия"},
        {"name": "Шкурка", "order": 11, "color": "#667eea", "category": "Отделочные работы"},
        {"name": "Покраска", "order": 12, "color": "#e53e3e", "category": "Отделочные работы"},
        {"name": "Покраска стен", "order": 13, "color": "#718096", "category": "Отделочные работы"},
        {"name": "Сапожок (после дверников)", "order": 14, "color": "#4a5568", "category": "Отделочные работы"},
        {"name": "Заделка штроб под радиатором", "order": 15, "color": "#2d3748", "category": "Специальные работы"},
        {"name": "Дверные откосы внутри квартиры", "order": 16, "color": "#1a202c", "category": "Специальные работы"},
        {"name": "Монтаж плитки на подоконники", "order": 17, "color": "#e53e3e", "category": "Специальные работы"},
        {"name": "Монтаж плитки на лифтовые порталы", "order": 18, "color": "#718096", "category": "Специальные работы"},
        {"name": "Монтаж табличек", "order": 19, "color": "#fd7900", "category": "Завершающие работы"},
        {"name": "Уборка", "order": 20, "color": "#38a169", "category": "Завершающие работы"}
    ]
    seeded_work_types = {wt_data['name']: WorkType(**wt_data) for wt_data in work_types_data}
    db.session.add_all(seeded_work_types.values())
    db.session.commit()

    executors_data = [
        "СМР Майкоп", "СМР Гулькевичи", "СМР Кропоткин", "Бригада №1", "Бригада №2", 
        "Электрики", "Сантехники", "Отделочники", "Универсалы", "Подрядчик А", "Подрядчик Б"
    ]
    seeded_executors = {ex_name: Executor(name=ex_name) for ex_name in executors_data}
    db.session.add_all(seeded_executors.values())
    db.session.commit()

    projects_data = {
        "maikop": {
            "code": "maikop",
            "icon": "🏗️",
            "name": "ЖК Майкоп литер 3.2",
            "description": "Современный жилой комплекс с коммерческими помещениями",
            "client": "Группа компаний Стройальянс",
            "contractor": "СМР Майкоп",
            "address": "г. Майкоп, пр. Ленина, 234",
            "startDate": "2024-05-31",
            "endDate": "2024-08-10",
            "budget": 1200000000,
            "blocks": [{"name": "М-1", "floors": ["1", "2", "3", "4", "5", "6", "7", "8", "9"]}, {"name": "М-2", "floors": ["1", "2", "3", "4", "5", "6", "7", "8", "9"]}],
            "objects": ["Коммерция", "Лифт.холл", "Квартиры", "МОП", "лест. м."]
        },
        "gulkevichi": {
            "code": "gulkevichi", 
            "icon": "🏢",
            "name": "ЖК Гулькевичи",
            "description": "Жилой комплекс в г. Гулькевичи. 4 блока с техническими помещениями",
            "client": "ООО Строй-Инвест",
            "contractor": "СМР Гулькевичи",
            "address": "г. Гулькевичи, ул. Центральная, 15",
            "startDate": "2024-06-27",
            "endDate": "2024-08-31", 
            "budget": 850000000,
            "blocks": [{"name": "Г-1", "floors": ["Тех. Подполье БС4", "Тех. Подполье БС2", "1", "2", "3", "4"]}, {"name": "Г-2", "floors": ["1", "2", "3", "4"]}, {"name": "Г-3", "floors": ["1", "2", "3", "4"]}, {"name": "Г-4", "floors": ["1", "2", "3", "4"]}],
            "objects": ["Электрощитовая", "ВНС", "Квартиры", "МОП", "Лифт.холл", "Лест. м.", "Коммерция"]
        },
        "kropotkin": {
            "code": "kropotkin",
            "icon": "🏭", 
            "name": "Кропоткин промышленный комплекс",
            "description": "Промышленный объект с производственными и административными помещениями",
            "client": "ПАО Кропоткинский завод",
            "contractor": "СМР Кропоткин",
            "address": "г. Кропоткин, ул. Промышленная, 88",
            "startDate": "2024-06-22",
            "endDate": "2024-08-31",
            "budget": 450000000,
            "blocks": [{"name": "К-2", "floors": ["Тех. Подполье", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}],
            "objects": ["Электрощитовая", "ВНС", "Квартиры", "МОП", "Лифт.холл", "Лест. м."]
        }
    }
    
    seeded_projects = {}
    seeded_blocks = {}
    seeded_floors = {}
    seeded_objects = {}

    for p_key, p_data in projects_data.items():
        project = Project(
            code=p_data['code'],
            icon=p_data['icon'],
            name=p_data['name'],
            description=p_data.get('description'),
            client=p_data.get('client'),
            contractor=p_data.get('contractor'),
            address=p_data.get('address'),
            start_date=datetime.strptime(p_data['startDate'], '%Y-%m-%d').date() if p_data.get('startDate') else None,
            end_date=datetime.strptime(p_data['endDate'], '%Y-%m-%d').date() if p_data.get('endDate') else None,
            budget=p_data.get('budget')
        )
        db.session.add(project)
        db.session.flush()
        seeded_projects[project.code] = project
        
        for block_data in p_data.get('blocks', []):
            block = Block(name=block_data['name'], project=project)
            db.session.add(block)
            db.session.flush()
            seeded_blocks[f"{project.code}-{block.name}"] = block
            
            for floor_number in block_data['floors']:
                floor = Floor(number=str(floor_number), block=block)
                db.session.add(floor)
                db.session.flush()
                seeded_floors[f"{project.code}-{block.name}-{floor.number}"] = floor

        for obj_name in p_data.get('objects', []):
            obj = Object(name=str(obj_name), project=project)
            db.session.add(obj)
            db.session.flush()
            seeded_objects[f"{project.code}-{obj.name}"] = obj
    
    db.session.commit()

    works_data = [] 
    all_floors = list(seeded_floors.values())
    all_objects = list(seeded_objects.values())

    if not all_floors or not all_objects:
        return jsonify({'message': 'No floors or objects to seed works'}), 500

    for _ in range(200):
        random_floor = random.choice(all_floors)
        random_project = random_floor.block.project
        
        related_objects = [obj for obj in all_objects if obj.project_id == random_project.id]

        if not related_objects:
            continue
            
        random_object = random.choice(related_objects)
        random_work_type = random.choice(list(seeded_work_types.values()))
        random_executor = random.choice(list(seeded_executors.values()))

        start_date = datetime.now().date() - timedelta(days=random.randint(0, 60))
        end_date = start_date + timedelta(days=random.randint(3, 14))
        progress = random.randint(0, 100)
        status = 'not-started'
        if progress == 100:
            status = 'completed'
        elif progress > 0:
            status = 'in-progress'
        
        if end_date < datetime.now().date() and status != 'completed':
            status = 'overdue'

        work_data = {
            "executor_id": random_executor.id,
            "work_type_id": random_work_type.id,
            "start_date": start_date,
            "end_date": end_date,
            "status": status,
            "priority": random.randint(1, 5),
            "progress": progress,
            "note": f"Generated note for {random_work_type.name} on floor {random_floor.number}",
            "floor_id": random_floor.id,
            "object_id": random_object.id,
        }
        works_data.append(work_data)

    for w_data in works_data:
        work = Work(**w_data)
        db.session.add(work)
    db.session.commit()

    return jsonify({'message': 'Database seeded successfully'}), 201