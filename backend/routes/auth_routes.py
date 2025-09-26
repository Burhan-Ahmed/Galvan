from flask import request
from flask_restx import Namespace, Resource, fields
from models import db, User
from utils import generate_otp, send_otp_email
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity

auth_ns = Namespace("auth", description="Authentication operations")

register_model = auth_ns.model("Register", {
    "profile_picture": fields.String,
    "first_name": fields.String(required=True),
    "last_name": fields.String(required=True),
    "email": fields.String(required=True),
    "password": fields.String(required=True),
    "mobile_number": fields.String(required=True),
})

login_model = auth_ns.model("Login", {
    "email": fields.String(required=True),
    "password": fields.String(required=True),
})

verify_model = auth_ns.model("Verify", {
    "email": fields.String(required=True),
    "otp": fields.String(required=True),
})

def create_user_from_form(first_name, last_name, email, password, mobile_number, profile_file=None, role="user", verified=False):
    """Create a user with optional profile picture."""
    if User.query.filter_by(email=email).first():
        return None, "Email already registered"

    profile_filename = None
    if profile_file:
        profile_filename = f"profile_{email}_{profile_file.filename}"
        profile_file.save(f"uploads/{profile_filename}") 

    user = User(
        profile_picture=profile_filename,
        first_name=first_name,
        last_name=last_name,
        email=email,
        mobile_number=mobile_number,
        role=role,
        is_verified=verified
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return user, None

@auth_ns.route("/register")
class Register(Resource):
    def post(self):
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        email = request.form.get("email")
        password = request.form.get("password")
        mobile_number = request.form.get("mobile_number")
        profile_file = request.files.get("profile_pic")

        user, err = create_user_from_form(first_name, last_name, email, password, mobile_number, profile_file)
        if err:
            return {"message": err}, 400

        # OTP
        otp = generate_otp()
        user.otp = otp
        send_otp_email(email, otp)
        db.session.commit()

        return {"message": "User registered. Please verify OTP sent to your email."}, 201


@auth_ns.route("/otpverification")
class Verify(Resource):
    @auth_ns.expect(verify_model)
    def post(self):
        data = request.json
        user = User.query.filter_by(email=data.get("email")).first()
        if not user or user.otp != data.get("otp"):
            return {"message": "Invalid OTP"}, 400

        user.is_verified = True
        user.otp = None
        db.session.commit()
        return {"message": "User verified successfully"}, 200



@auth_ns.route("/login")
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        data = request.json
        user = User.query.filter_by(email=data.get("email")).first()

        if not user or not user.check_password(data.get("password")):
            return {"message": "Invalid credentials"}, 401
        if not user.is_verified:
            return {"message": "Please verify your email first"}, 403

        access_token = create_access_token(
            identity=str(user.id),
            additional_claims={
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "mobile_number": user.mobile_number
            }
        )
        refresh_token = create_refresh_token(
            identity=str(user.id),
            additional_claims={"role": user.role}
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "role": user.role
        }, 200

@auth_ns.route("/refresh")
class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity)
        return {"access_token": access_token}, 200
