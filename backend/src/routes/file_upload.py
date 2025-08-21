from flask import Blueprint, request, jsonify, send_from_directory, current_app
from src.models import db, Submission, User, Assignment
from src.utils.jwt_utils import token_required, student_required, teacher_required
import os
import uuid
import time
import logging
from werkzeug.utils import secure_filename
from werkzeug.exceptions import RequestEntityTooLarge

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

file_upload_bp = Blueprint('file_upload', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'uploads')
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'}
# Совпадает с настройкой в main.py
ALLOWED_ORIGINS = {
    "https://skiil-up.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
}

# Максимальный размер файла (100MB)
MAX_FILE_SIZE = 100 * 1024 * 1024

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_unique_filename(original_filename, assignment_id, student_id):
    """Generate a unique filename that includes assignment and student info"""
    from werkzeug.utils import secure_filename
    
    # Secure the original filename first
    safe_filename = secure_filename(original_filename)
    
    # If the filename is empty after securing, use a default name
    if not safe_filename:
        safe_filename = "file"
    
    timestamp = int(time.time())
    unique_id = str(uuid.uuid4())[:8]  # Use first 8 characters of UUID
    
    # Get extension from the safe filename
    extension = ""
    base_name = safe_filename
    if '.' in safe_filename:
        parts = safe_filename.rsplit('.', 1)
        base_name = parts[0]
        extension = parts[1].lower()
    
    # Format: assignment_{id}_student_{id}_{timestamp}_{uuid}_{safename}.{extension}
    unique_filename = f"assignment_{assignment_id}_student_{student_id}_{timestamp}_{unique_id}_{base_name}"
    if extension:
        unique_filename += f".{extension}"
    
    return unique_filename

def cleanup_orphaned_files():
    """Remove files that are not referenced by any submission"""
    try:
        logger.info("Starting orphaned files cleanup")
        
        # Get all files in upload directory
        if not os.path.exists(UPLOAD_FOLDER):
            logger.info("Upload folder does not exist, nothing to clean")
            return 0
        
        uploaded_files = set()
        total_size = 0
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                uploaded_files.add(filename)
                total_size += os.path.getsize(file_path)
        
        logger.info(f"Found {len(uploaded_files)} files in upload directory, total size: {total_size / (1024*1024):.2f} MB")
        
        # Get all files referenced in submissions
        referenced_files = set()
        submissions = Submission.query.filter(Submission.file_path.isnot(None)).all()
        for submission in submissions:
            if submission.file_path:
                referenced_files.add(submission.file_path)
        
        logger.info(f"Found {len(referenced_files)} referenced files in database")
        
        # Find orphaned files
        orphaned_files = uploaded_files - referenced_files
        
        if not orphaned_files:
            logger.info("No orphaned files found")
            return 0
        
        logger.info(f"Found {len(orphaned_files)} orphaned files to remove")
        
        # Remove orphaned files
        removed_count = 0
        removed_size = 0
        for filename in orphaned_files:
            try:
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                file_size = os.path.getsize(file_path)
                os.remove(file_path)
                removed_count += 1
                removed_size += file_size
                logger.info(f"Removed orphaned file: {filename} ({file_size} bytes)")
            except Exception as e:
                logger.error(f"Error removing orphaned file {filename}: {e}")
        
        logger.info(f"Cleanup completed. Removed {removed_count} orphaned files, freed {removed_size / (1024*1024):.2f} MB")
        return removed_count
        
    except Exception as e:
        logger.error(f"Error during file cleanup: {e}")
        return 0

def verify_file_integrity(filename):
    """Verify that a file exists and has non-zero size"""
    try:
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(file_path):
            logger.warning(f"File does not exist: {filename}")
            return False, "File does not exist"
        
        if not os.path.isfile(file_path):
            logger.warning(f"Path is not a file: {filename}")
            return False, "Path is not a file"
        
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            logger.warning(f"File is empty: {filename}")
            return False, "File is empty"
        
        logger.info(f"File integrity verified: {filename} ({file_size} bytes)")
        return True, f"File OK ({file_size} bytes)"
        
    except Exception as e:
        logger.error(f"Error verifying file integrity for {filename}: {e}")
        return False, f"Error: {str(e)}"

@file_upload_bp.route('/upload', methods=['OPTIONS'])
def handle_upload_options():
    """Handle CORS preflight requests for file upload"""
    response = jsonify({'message': 'OK'})
    origin = request.headers.get('Origin')
    if origin in ALLOWED_ORIGINS:
        response.headers['Access-Control-Allow-Origin'] = origin
        response.headers['Vary'] = 'Origin'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response, 200

@file_upload_bp.route('/upload', methods=['POST'])
@token_required
@student_required
def upload_file(current_user):
    """Upload file for assignment submission"""
    try:
        logger.info(f"File upload attempt by user {current_user.id} ({current_user.email})")
        
        if 'file' not in request.files:
            logger.warning(f"No file part in request from user {current_user.id}")
            return jsonify({'message': 'No file part in the request'}), 400
        
        file = request.files['file']
        assignment_id = request.form.get('assignment_id')
        
        logger.info(f"Upload request - File: {file.filename}, Assignment: {assignment_id}, User: {current_user.id}")
        
        if file.filename == '':
            logger.warning(f"Empty filename in request from user {current_user.id}")
            return jsonify({'message': 'No selected file'}), 400
        
        if not assignment_id:
            logger.warning(f"No assignment_id in request from user {current_user.id}")
            return jsonify({'message': 'Assignment ID is required'}), 400
        
        # Check if assignment exists
        assignment = Assignment.query.get(assignment_id)
        if not assignment:
            logger.warning(f"Assignment {assignment_id} not found for user {current_user.id}")
            return jsonify({'message': 'Assignment not found'}), 404
        
        if file and allowed_file(file.filename):
            # Проверяем размер файла
            file.seek(0, os.SEEK_END)
            file_size = file.tell()
            file.seek(0)  # Возвращаем указатель в начало
            
            logger.info(f"File size: {file_size} bytes for user {current_user.id}")
            
            if file_size > MAX_FILE_SIZE:
                logger.warning(f"File too large: {file_size} bytes from user {current_user.id}")
                return jsonify({
                    'message': f'File size too large. Maximum allowed size is {MAX_FILE_SIZE // (1024*1024)}MB'
                }), 413
            
            # Secure the filename and generate unique name
            original_filename = secure_filename(file.filename)
            unique_filename = generate_unique_filename(original_filename, assignment_id, current_user.id)
            file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
            
            logger.info(f"Generated filename: {unique_filename} for user {current_user.id}")
            
            # Ensure the filename is truly unique (very unlikely collision, but just in case)
            counter = 1
            while os.path.exists(file_path):
                unique_filename = generate_unique_filename(original_filename, assignment_id, current_user.id)
                file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
                counter += 1
                if counter > 10:  # Prevent infinite loop
                    logger.error(f"Unable to generate unique filename after {counter} attempts for user {current_user.id}")
                    return jsonify({'message': 'Unable to generate unique filename'}), 500
            
            try:
                file.save(file_path)
                
                # Verify file was saved correctly
                if not os.path.exists(file_path):
                    logger.error(f"File upload failed - file not saved for user {current_user.id}")
                    return jsonify({'message': 'File upload failed - file not saved'}), 500
                
                # Verify file size after save
                saved_file_size = os.path.getsize(file_path)
                logger.info(f"File saved successfully. Original size: {file_size}, Saved size: {saved_file_size} for user {current_user.id}")
                
                if saved_file_size != file_size:
                    logger.warning(f"File size mismatch. Original: {file_size}, Saved: {saved_file_size} for user {current_user.id}")
                
                return jsonify({
                    'message': 'File uploaded successfully',
                    'file_path': unique_filename,
                    'file_name': original_filename,
                    'assignment_id': assignment_id,
                    'file_size': file_size
                }), 200
            except Exception as e:
                logger.error(f"File save error for user {current_user.id}: {str(e)}")
                # Clean up if file was partially saved
                if os.path.exists(file_path):
                    try:
                        os.remove(file_path)
                        logger.info(f"Cleaned up partially saved file for user {current_user.id}")
                    except:
                        pass
                return jsonify({'message': f'File upload failed: {str(e)}'}), 500
        else:
            logger.warning(f"File type not allowed: {file.filename} from user {current_user.id}")
            return jsonify({'message': 'File type not allowed'}), 400
            
    except RequestEntityTooLarge:
        logger.warning(f"Request entity too large from user {current_user.id}")
        return jsonify({
            'message': f'File size too large. Maximum allowed size is {MAX_FILE_SIZE // (1024*1024)}MB'
        }), 413
    except Exception as e:
        logger.error(f"Upload error for user {current_user.id}: {str(e)}")
        return jsonify({'message': f'Upload error: {str(e)}'}), 500

@file_upload_bp.route('/download/<filename>', methods=['GET'])
@token_required
def download_file(current_user, filename):
    """Download file with access control"""
    try:
        logger.info(f"File download attempt by user {current_user.id} ({current_user.email}) for file: {filename}")
        
        # Basic security check: prevent directory traversal
        if ".." in filename or filename.startswith('/') or '\\' in filename:
            logger.warning(f"Invalid filename attempt by user {current_user.id}: {filename}")
            return jsonify({'message': 'Invalid filename'}), 400

        file_full_path = os.path.join(UPLOAD_FOLDER, filename)
        if not os.path.exists(file_full_path):
            logger.warning(f"File not found: {filename} requested by user {current_user.id}")
            return jsonify({'message': 'File not found'}), 404
        
        # Check if file is actually a file (not a directory)
        if not os.path.isfile(file_full_path):
            logger.warning(f"Path is not a file: {filename} requested by user {current_user.id}")
            return jsonify({'message': 'Invalid file'}), 400
        
        # Find submission with this file
        submission = Submission.query.filter_by(file_path=filename).first()
        if not submission:
            logger.warning(f"File not associated with any submission: {filename} requested by user {current_user.id}")
            return jsonify({'message': 'File not associated with any submission'}), 404
        
        # Check access permissions
        if current_user.is_student():
            # Students can only download their own files
            if submission.student_id != current_user.id:
                logger.warning(f"Access denied for student {current_user.id} to file {filename}")
                return jsonify({'message': 'Access denied'}), 403
        elif current_user.is_teacher() and not current_user.is_admin():
            # Teachers can download files from their assignments
            if submission.assignment.topic.teacher_id != current_user.id:
                logger.warning(f"Access denied for teacher {current_user.id} to file {filename}")
                return jsonify({'message': 'Access denied'}), 403
        # Admins can download any file
        
        # Use original filename for download
        download_name = submission.file_name if submission.file_name else filename
        
        # Get file size for better error handling
        file_size = os.path.getsize(file_full_path)
        logger.info(f"File size: {file_size} bytes for file {filename} requested by user {current_user.id}")
        
        if file_size == 0:
            logger.warning(f"File is empty: {filename} requested by user {current_user.id}")
            return jsonify({'message': 'File is empty'}), 400
        
        # Check for range request (partial download)
        range_header = request.headers.get('Range', None)
        if range_header:
            try:
                # Parse range header
                range_match = range_header.replace('bytes=', '').split('-')
                start = int(range_match[0]) if range_match[0] else 0
                end = int(range_match[1]) if range_match[1] else file_size - 1
                
                if start >= file_size or end >= file_size or start > end:
                    return jsonify({'message': 'Invalid range'}), 416
                
                # Calculate content length for range
                content_length = end - start + 1
                
                # Read file chunk
                with open(file_full_path, 'rb') as f:
                    f.seek(start)
                    data = f.read(content_length)
                
                response = jsonify({'message': 'Range request not fully supported yet'})
                response.status_code = 206
                response.headers['Content-Range'] = f'bytes {start}-{end}/{file_size}'
                response.headers['Content-Length'] = content_length
                response.headers['Accept-Ranges'] = 'bytes'
                response.headers['Content-Disposition'] = f'attachment; filename="{download_name}"'
                
                logger.info(f"Range request processed: {start}-{end}/{file_size} for file {filename} to user {current_user.id}")
                return response
                
            except (ValueError, IndexError):
                logger.warning(f"Invalid range header: {range_header} from user {current_user.id}")
                return jsonify({'message': 'Invalid range header'}), 400
        
        # Use send_from_directory with proper headers for large files
        response = send_from_directory(
            UPLOAD_FOLDER, 
            filename, 
            as_attachment=True, 
            download_name=download_name
        )
        
        # Add headers for better file handling
        response.headers['Content-Length'] = file_size
        response.headers['Accept-Ranges'] = 'bytes'
        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'
        
        logger.info(f"File download successful: {filename} ({file_size} bytes) to user {current_user.id}")
        return response
        
    except Exception as e:
        logger.error(f"Download error for user {current_user.id} for file {filename}: {str(e)}")
        return jsonify({'message': f'Download error: {str(e)}'}), 500

@file_upload_bp.route('/submissions/<int:submission_id>/files', methods=['GET'])
@token_required
def get_submission_files(current_user, submission_id):
    """Get files associated with a submission"""
    try:
        submission = Submission.query.get(submission_id)
        if not submission:
            return jsonify({'message': 'Submission not found'}), 404
        
        # Check access permissions
        if current_user.is_student():
            if submission.student_id != current_user.id:
                return jsonify({'message': 'Access denied'}), 403
        elif current_user.is_teacher() and not current_user.is_admin():
            if submission.assignment.topic.teacher_id != current_user.id:
                return jsonify({'message': 'Access denied'}), 403
        
        files = []
        if submission.file_path:
            # Check if file actually exists
            file_path = os.path.join(UPLOAD_FOLDER, submission.file_path)
            file_exists = os.path.exists(file_path) and os.path.isfile(file_path)
            
            # Получаем базовый URL из конфигурации приложения
            from flask import current_app
            backend_base_url = current_app.config.get('BACKEND_BASE_URL', 'https://tetrixuno.ddns.net')
            
            # Логируем для отладки
            logger.info(f"Generating download URL with backend_base_url: {backend_base_url}")
            
            files.append({
                'file_path': submission.file_path,
                'file_name': submission.file_name or submission.file_path,
                'download_url': f'{backend_base_url}/api/files/download/{submission.file_path}',
                'file_exists': file_exists,
                'file_size': os.path.getsize(file_path) if file_exists else 0
            })
        
        return jsonify({'files': files}), 200

    except Exception as e:
        return jsonify({'message': f'Error getting files: {str(e)}'}), 500

@file_upload_bp.route('/cleanup', methods=['POST'])
@token_required
def cleanup_files(current_user):
    """Clean up orphaned files (admin only)"""
    try:
        if not current_user.is_admin():
            return jsonify({'message': 'Access denied'}), 403
        
        removed_count = cleanup_orphaned_files()
        
        return jsonify({
            'message': f'Cleanup completed. Removed {removed_count} orphaned files.',
            'removed_count': removed_count
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Cleanup error: {str(e)}'}), 500

@file_upload_bp.route('/stats', methods=['GET'])
@token_required
def get_file_stats(current_user):
    """Get file upload statistics (admin only)"""
    try:
        if not current_user.is_admin():
            return jsonify({'message': 'Access denied'}), 403
        
        # Count files in upload directory
        file_count = 0
        total_size = 0
        if os.path.exists(UPLOAD_FOLDER):
            for filename in os.listdir(UPLOAD_FOLDER):
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                if os.path.isfile(file_path):
                    file_count += 1
                    total_size += os.path.getsize(file_path)
        
        # Count referenced files
        referenced_count = Submission.query.filter(Submission.file_path.isnot(None)).count()
        
        # Calculate orphaned files
        orphaned_count = file_count - referenced_count
        
        return jsonify({
            'total_files': file_count,
            'referenced_files': referenced_count,
            'orphaned_files': orphaned_count,
            'total_size_mb': round(total_size / (1024 * 1024), 2)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error getting stats: {str(e)}'}), 500

@file_upload_bp.route('/verify/<filename>', methods=['GET'])
@token_required
def verify_file(current_user, filename):
    """Verify file integrity (admin only)"""
    try:
        if not current_user.is_admin():
            return jsonify({'message': 'Access denied'}), 403
        
        is_valid, message = verify_file_integrity(filename)
        
        return jsonify({
            'filename': filename,
            'is_valid': is_valid,
            'message': message
        }), 200
        
    except Exception as e:
        logger.error(f"Error verifying file {filename}: {e}")
        return jsonify({'message': f'Verification error: {str(e)}'}), 500

@file_upload_bp.route('/verify-all', methods=['GET'])
@token_required
def verify_all_files(current_user):
    """Verify integrity of all files (admin only)"""
    try:
        if not current_user.is_admin():
            return jsonify({'message': 'Access denied'}), 403
        
        if not os.path.exists(UPLOAD_FOLDER):
            return jsonify({'message': 'Upload folder does not exist'}), 404
        
        results = []
        total_files = 0
        valid_files = 0
        total_size = 0
        
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                total_files += 1
                is_valid, message = verify_file_integrity(filename)
                if is_valid:
                    valid_files += 1
                    file_size = os.path.getsize(file_path)
                    total_size += file_size
                
                results.append({
                    'filename': filename,
                    'is_valid': is_valid,
                    'message': message,
                    'size': os.path.getsize(file_path) if os.path.exists(file_path) else 0
                })
        
        return jsonify({
            'total_files': total_files,
            'valid_files': valid_files,
            'invalid_files': total_files - valid_files,
            'total_size_mb': round(total_size / (1024 * 1024), 2),
            'results': results
        }), 200
        
    except Exception as e:
        logger.error(f"Error verifying all files: {e}")
        return jsonify({'message': f'Verification error: {str(e)}'}), 500



