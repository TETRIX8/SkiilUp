import requests
import json
from src.models import User

# URL email сервиса
EMAIL_SERVICE_URL = "http://localhost:3001"

def send_new_assignment_notification(assignment, students=None):
    """
    Отправить уведомления о новом задании всем студентам или конкретным студентам
    """
    try:
        # Если студенты не указаны, отправляем всем студентам
        if students is None:
            students = User.query.filter_by(role='student').all()
        
        success_count = 0
        for student in students:
            try:
                # Подготавливаем данные для отправки
                notification_data = {
                    'studentEmail': student.email,
                    'studentName': f"{student.first_name} {student.last_name}",
                    'assignmentTitle': assignment.title,
                    'assignmentDescription': assignment.description,
                    'teacherName': f"{assignment.topic.teacher.first_name} {assignment.topic.teacher.last_name}",
                    'dueDate': assignment.due_date.isoformat() if assignment.due_date else None,
                    'maxScore': assignment.max_score
                }
                
                # Отправляем запрос к email сервису
                response = requests.post(
                    f"{EMAIL_SERVICE_URL}/send-new-assignment",
                    json=notification_data,
                    timeout=10
                )
                
                if response.status_code == 200:
                    success_count += 1
                    print(f"✅ Уведомление о задании '{assignment.title}' отправлено {student.email}")
                else:
                    print(f"❌ Ошибка отправки уведомления {student.email}: {response.text}")
                    
            except Exception as e:
                print(f"❌ Ошибка отправки уведомления студенту {student.email}: {str(e)}")
                
        print(f"📧 Уведомления о новом задании отправлены: {success_count}/{len(students)}")
        return success_count > 0
        
    except Exception as e:
        print(f"❌ Общая ошибка отправки уведомлений о задании: {str(e)}")
        return False


def send_grade_notification(submission):
    """
    Отправить уведомление студенту о выставлении оценки
    """
    try:
        # Подготавливаем данные для отправки
        notification_data = {
            'studentEmail': submission.student.email,
            'studentName': f"{submission.student.first_name} {submission.student.last_name}",
            'assignmentTitle': submission.assignment.title,
            'score': submission.score,
            'maxScore': submission.assignment.max_score,
            'feedback': submission.feedback,
            'teacherName': f"{submission.assignment.topic.teacher.first_name} {submission.assignment.topic.teacher.last_name}"
        }
        
        # Отправляем запрос к email сервису
        response = requests.post(
            f"{EMAIL_SERVICE_URL}/send-grade-notification",
            json=notification_data,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ Уведомление об оценке отправлено {submission.student.email}")
            return True
        else:
            print(f"❌ Ошибка отправки уведомления об оценке: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка отправки уведомления об оценке: {str(e)}")
        return False


def send_sms_verification_code(user):
    """
    Отправить SMS-код подтверждения на email пользователя
    """
    try:
        # Подготавливаем данные для отправки
        verification_data = {
            'email': user.email,
            'firstName': user.first_name,
            'lastName': user.last_name
        }
        
        # Отправляем запрос к email сервису
        response = requests.post(
            f"{EMAIL_SERVICE_URL}/send-verification",
            json=verification_data,
            timeout=10
        )
        
        if response.status_code == 200:
            response_data = response.json()
            print(f"✅ SMS-код отправлен на {user.email}")
            return {
                'success': True,
                'verification_code': response_data.get('verificationCode'),
                'message_id': response_data.get('messageId')
            }
        else:
            print(f"❌ Ошибка отправки SMS-кода: {response.text}")
            return {'success': False, 'error': response.text}
            
    except Exception as e:
        print(f"❌ Ошибка отправки SMS-кода: {str(e)}")
        return {'success': False, 'error': str(e)}


def send_password_reset_notification(user, reset_token):
    """
    Отправить уведомление о восстановлении пароля
    """
    try:
        # Подготавливаем данные для отправки
        reset_data = {
            'email': user.email,
            'firstName': user.first_name,
            'resetToken': reset_token
        }
        
        # Отправляем запрос к email сервису
        response = requests.post(
            f"{EMAIL_SERVICE_URL}/send-password-reset",
            json=reset_data,
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"✅ Письмо восстановления пароля отправлено {user.email}")
            return True
        else:
            print(f"❌ Ошибка отправки письма восстановления: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Ошибка отправки письма восстановления: {str(e)}")
        return False


def check_email_service_health():
    """
    Проверить работоспособность email сервиса
    """
    try:
        response = requests.get(f"{EMAIL_SERVICE_URL}/health", timeout=5)
        return response.status_code == 200
    except:
        return False