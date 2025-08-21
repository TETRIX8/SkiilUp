import requests
import os
from flask import current_app
import secrets

# Email service configuration
EMAIL_SERVICE_URL = os.getenv('EMAIL_SERVICE_URL', 'http://localhost:3001')

def send_verification_email(user):
    """Send email verification email via Node.js email service"""
    try:
        # Generate verification token if not exists
        if not user.verification_token:
            user.verification_token = secrets.token_urlsafe(32)
        
        # Prepare data for email service
        email_data = {
            'email': user.email,
            'firstName': user.first_name,
            'lastName': user.last_name
        }
        
        # Send request to Node.js email service
        response = requests.post(
            f'{EMAIL_SERVICE_URL}/send-verification',
            json=email_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"=== EMAIL SENT VIA NODEMAILER ===")
            print(f"To: {user.email}")
            print(f"Verification Code: {result.get('verificationCode', 'N/A')}")
            print(f"Message ID: {result.get('messageId', 'N/A')}")
            print(f"================================")
            
            # Store the verification code in user's verification_token field
            if 'verificationCode' in result:
                user.verification_token = result['verificationCode']
            
            return True
        else:
            print(f"Error from email service: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error sending verification email via Node.js service: {str(e)}")
        return False

def send_password_reset_email(user, reset_token):
    """Send password reset email via Node.js email service"""
    try:
        # Prepare data for email service
        email_data = {
            'email': user.email,
            'firstName': user.first_name,
            'resetToken': reset_token
        }
        
        # Send request to Node.js email service
        response = requests.post(
            f'{EMAIL_SERVICE_URL}/send-password-reset',
            json=email_data,
            timeout=10
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"=== PASSWORD RESET EMAIL SENT VIA NODEMAILER ===")
            print(f"To: {user.email}")
            print(f"Message ID: {result.get('messageId', 'N/A')}")
            print(f"===============================================")
            return True
        else:
            print(f"Error from email service: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"Error sending password reset email via Node.js service: {str(e)}")
        return False

