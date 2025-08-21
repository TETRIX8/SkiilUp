#!/usr/bin/env python3
"""
Script to create sample topics for each discipline
"""
import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models import db, Discipline, Topic, User
from src.main import app

def create_sample_topics():
    """Create sample topics for each discipline"""
    
    sample_topics = [
        {
            'discipline_name': 'Операционные системы и среды',
            'topics': [
                {
                    'title': 'Введение в операционные системы',
                    'description': 'Основные понятия, типы ОС, архитектура',
                    'content': '# Введение в операционные системы\n\nОперационная система (ОС) — это комплекс взаимосвязанных программ, предназначенных для управления ресурсами компьютера и организации взаимодействия с пользователем.\n\n## Основные функции ОС:\n\n- Управление процессами\n- Управление памятью\n- Управление файловой системой\n- Управление устройствами ввода-вывода\n- Обеспечение безопасности'
                },
                {
                    'title': 'Управление процессами',
                    'description': 'Процессы, потоки, планирование',
                    'content': '# Управление процессами\n\nПроцесс — это программа в состоянии выполнения. Управление процессами является одной из ключевых функций операционной системы.\n\n## Состояния процесса:\n\n1. **Готов** — процесс готов к выполнению\n2. **Выполняется** — процесс выполняется на процессоре\n3. **Заблокирован** — процесс ожидает завершения операции ввода-вывода'
                }
            ]
        },
        {
            'discipline_name': 'Основы алгоритмизации и программирования',
            'topics': [
                {
                    'title': 'Основы Python',
                    'description': 'Синтаксис, типы данных, управляющие структуры',
                    'content': '# Основы языка Python\n\nPython — это высокоуровневый язык программирования общего назначения.\n\n## Основные типы данных:\n\n```python\n# Числа\nint_number = 42\nfloat_number = 3.14\n\n# Строки\ntext = "Hello, World!"\n\n# Списки\nmy_list = [1, 2, 3, 4, 5]\n\n# Словари\nmy_dict = {"name": "John", "age": 30}\n```'
                },
                {
                    'title': 'Алгоритмы сортировки',
                    'description': 'Пузырьковая сортировка, быстрая сортировка, сортировка слиянием',
                    'content': '# Алгоритмы сортировки\n\nСортировка — это процесс упорядочивания элементов по определенному критерию.\n\n## Пузырьковая сортировка\n\n```python\ndef bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n-i-1):\n            if arr[j] > arr[j+1]:\n                arr[j], arr[j+1] = arr[j+1], arr[j]\n    return arr\n```'
                }
            ]
        },
        {
            'discipline_name': 'Компьютерные сети',
            'topics': [
                {
                    'title': 'Модель OSI',
                    'description': 'Семиуровневая модель взаимодействия открытых систем',
                    'content': '# Модель OSI\n\nМодель OSI (Open Systems Interconnection) — это концептуальная модель, которая характеризует и стандартизует функции телекоммуникационной или вычислительной системы.\n\n## Уровни модели OSI:\n\n1. **Физический уровень** — передача битов по физической среде\n2. **Канальный уровень** — обеспечение надежной передачи кадров\n3. **Сетевой уровень** — маршрутизация пакетов\n4. **Транспортный уровень** — надежная доставка данных\n5. **Сеансовый уровень** — управление сеансами связи\n6. **Уровень представления** — кодирование и сжатие данных\n7. **Прикладной уровень** — интерфейс с пользователем'
                }
            ]
        }
    ]
    
    # Get admin user (teacher)
    admin_user = User.query.filter_by(role='admin').first()
    if not admin_user:
        print("❌ No admin user found! Please create an admin user first.")
        return 0
    
    created_count = 0
    
    for discipline_data in sample_topics:
        # Find discipline
        discipline = Discipline.query.filter_by(name=discipline_data['discipline_name']).first()
        if not discipline:
            print(f"⚠️  Discipline '{discipline_data['discipline_name']}' not found, skipping...")
            continue
        
        print(f"📚 Adding topics to discipline: {discipline.name}")
        
        for topic_data in discipline_data['topics']:
            # Check if topic already exists
            existing_topic = Topic.query.filter_by(
                title=topic_data['title'], 
                discipline_id=discipline.id
            ).first()
            
            if not existing_topic:
                topic = Topic(
                    title=topic_data['title'],
                    description=topic_data['description'],
                    content=topic_data['content'],
                    discipline_id=discipline.id,
                    teacher_id=admin_user.id
                )
                db.session.add(topic)
                created_count += 1
                print(f"  ✓ Created topic: {topic_data['title']}")
            else:
                print(f"  • Topic already exists: {topic_data['title']}")
    
    return created_count

def main():
    """Run the sample data creation"""
    print("🚀 Creating sample topics...")
    
    with app.app_context():
        try:
            created_count = create_sample_topics()
            
            # Commit all changes
            db.session.commit()
            
            print(f"\n🎉 Sample data creation completed!")
            print(f"   • Created {created_count} new topics")
            
            # Show current state
            print("\n📊 Current disciplines and topics:")
            disciplines = Discipline.query.all()
            for disc in disciplines:
                topic_count = len(disc.topics)
                print(f"   • {disc.name}: {topic_count} topics")
                for topic in disc.topics:
                    print(f"     - {topic.title}")
                    
        except Exception as e:
            db.session.rollback()
            print(f"❌ Sample data creation failed: {str(e)}")
            return 1
    
    return 0

if __name__ == '__main__':
    exit(main())