import random
import smtplib
from email.mime.text import MIMEText

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(receiver_email, otp):
    sender_email = "your_email@gmail.com"
    sender_password = "your_app_password"  # App Password for Gmail

    msg = MIMEText(f"Your OTP code is: {otp}")
    msg["Subject"] = "Verify your account"
    msg["From"] = sender_email
    msg["To"] = receiver_email

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
        return True
    except Exception as e:
        print("Error sending email:", e)
        return False
