import random
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

# Load .env directly
load_dotenv()
EMAIL_USER = os.getenv("EMAIL_USER")
EMAIL_PASS = os.getenv("EMAIL_PASS")

def generate_otp():
    """Generate a 6-digit OTP as string"""
    return str(random.randint(100000, 999999))

def send_otp_email(receiver_email, otp):
    """Send OTP email using EMAIL_USER and EMAIL_PASS"""
    msg = MIMEText(f"Your OTP code is: {otp}")
    msg["Subject"] = "Verify your account"
    msg["From"] = EMAIL_USER
    msg["To"] = receiver_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(EMAIL_USER, EMAIL_PASS)
            server.sendmail(EMAIL_USER, receiver_email, msg.as_string())
        return True
    except Exception as e:
        print("Error sending email:", e)
        return False
