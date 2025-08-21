#!/usr/bin/env python3
"""
Migration script to add disciplines and migrate existing topics
"""
import os
import sys

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from src.models import db, Discipline, Topic
from src.main import app

def create_default_disciplines():
    """Create the 5 required disciplines"""
    disciplines_data = [
        {
            'name': 'Операционные системы и среды',
            'description': 'Изучение принципов работы операционных систем, управления процессами, памятью и файловыми системами'
        },
        {
            'name': 'Архитектура аппаратных средств',
            'description': 'Основы устройства компьютерных систем, процессоров, памяти и периферийных устройств'
        },
        {
            'name': 'Информационные технологии',
            'description': 'Современные информационные технологии, базы данных, сетевые технологии и интернет-сервисы'
        },
        {
            'name': 'Основы алгоритмизации и программирования',
            'description': 'Фундаментальные принципы программирования, алгоритмы, структуры данных и языки программирования'
        },
        {
            'name': 'Компьютерные сети',
            'description': 'Архитектура компьютерных сетей, протоколы передачи данных, сетевое администрирование'
        }
    ]
    
    created_disciplines = []
    
    for disc_data in disciplines_data:
        # Check if discipline already exists
        existing = Discipline.query.filter_by(name=disc_data['name']).first()
        if not existing:
            discipline = Discipline(
                name=disc_data['name'],
                description=disc_data['description']
            )
            db.session.add(discipline)
            created_disciplines.append(disc_data['name'])
            print(f"✓ Created discipline: {disc_data['name']}")
        else:
            print(f"• Discipline already exists: {disc_data['name']}")
    
    return created_disciplines

def migrate_existing_topics():
    """Migrate existing topics to the first discipline (for demo purposes)"""
    topics_without_discipline = Topic.query.filter_by(discipline_id=None).all()
    
    if topics_without_discipline:
        # Get the first discipline (or create a default one)
        default_discipline = Discipline.query.first()
        if not default_discipline:
            default_discipline = Discipline(
                name='Основы алгоритмизации и программирования',
                description='Фундаментальные принципы программирования, алгоритмы, структуры данных и языки программирования'
            )
            db.session.add(default_discipline)
            db.session.commit()
        
        # Assign all existing topics to the default discipline
        for topic in topics_without_discipline:
            topic.discipline_id = default_discipline.id
            print(f"✓ Migrated topic '{topic.title}' to discipline '{default_discipline.name}'")
        
        return len(topics_without_discipline)
    
    return 0

def main():
    """Run the migration"""
    print("🚀 Starting discipline migration...")
    
    with app.app_context():
        try:
            # Create tables if they don't exist
            db.create_all()
            print("✓ Database tables created/verified")
            
            # Create default disciplines
            created_disciplines = create_default_disciplines()
            
            # Migrate existing topics
            migrated_topics = migrate_existing_topics()
            
            # Commit all changes
            db.session.commit()
            
            print("\n🎉 Migration completed successfully!")
            print(f"   • Created {len(created_disciplines)} new disciplines")
            print(f"   • Migrated {migrated_topics} existing topics")
            
            # Show current state
            print("\n📊 Current disciplines:")
            disciplines = Discipline.query.all()
            for disc in disciplines:
                topic_count = len(disc.topics)
                print(f"   • {disc.name} ({topic_count} topics)")
                
        except Exception as e:
            db.session.rollback()
            print(f"❌ Migration failed: {str(e)}")
            return 1
    
    return 0

if __name__ == '__main__':
    exit(main())