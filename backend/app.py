from flask import Flask, request
from flask_restx import Api, Resource, fields
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
)
from models import db, User
from utils import generate_otp, send_otp_email

app = Flask(__name__)
#CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/admin/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

@app.after_request
def add_cors_headers(response):
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response


# Config
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "supersecretkey"

db.init_app(app)
jwt = JWTManager(app)

api = Api(app, version="1.0", title="Auth API", description="Authentication + RBAC API")

auth_ns = api.namespace("auth", description="Authentication operations")
admin_ns = api.namespace("admin", description="Admin operations")

# Models
register_model = api.model("Register", {
    "profile_picture": fields.String,
    "first_name": fields.String(required=True),
    "last_name": fields.String(required=True),
    "email": fields.String(required=True),
    "password": fields.String(required=True),
    "mobile_number": fields.String(required=True),
})

login_model = api.model("Login", {
    "email": fields.String(required=True),
    "password": fields.String(required=True),
})

verify_model = api.model("Verify", {
    "email": fields.String(required=True),
    "otp": fields.String(required=True),
})

user_model = api.model("User", {
    "id": fields.Integer,
    "first_name": fields.String,
    "last_name": fields.String,
    "email": fields.String,
    "role": fields.String,
    "is_verified": fields.Boolean
})

# 🔹 Register (User / Super Admin)
@auth_ns.route("/register")
class Register(Resource):
    @auth_ns.expect(register_model)
    def post(self):
        """Register a new user (default: role=user) with optional profile picture"""
        # Get text fields from form
        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        email = request.form.get("email")
        password = request.form.get("password")
        mobile_number = request.form.get("mobile")

        # Get file (profile picture)
        profile_file = request.files.get("profile_pic")
        profile_filename = None

        if User.query.filter_by(email=email).first():
            return {"message": "Email already registered"}, 400

        # Save file locally (optional: you can use Cloudinary or other storage)
        if profile_file:
            profile_filename = f"profile_{email}_{profile_file.filename}"
            profile_file.save(f"uploads/{profile_filename}")  # make sure 'uploads/' folder exists

        # Generate OTP
        otp = generate_otp()
        send_otp_email(email, otp)

        # Create user
        user = User(
            profile_picture=profile_filename,
            first_name=first_name,
            last_name=last_name,
            email=email,
            mobile_number=mobile_number,
            otp=otp,
            role="user"  # only SuperAdmin can create admins
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        return {"message": "User registered. Please verify OTP sent to your email."}, 201


# 🔹 OTP Verification
@auth_ns.route("/otpverification")
class Verify(Resource):
    @auth_ns.expect(verify_model)
    def post(self):
        """Verify OTP"""
        data = request.json
        user = User.query.filter_by(email=data["email"]).first()

        if not user or user.otp != data["otp"]:
            return {"message": "Invalid OTP"}, 400

        user.is_verified = True
        user.otp = None
        db.session.commit()
        return {"message": "User verified successfully"}, 200


# 🔹 Login (JWT Access + Refresh Tokens)
@auth_ns.route("/login")
class Login(Resource):
    @auth_ns.expect(login_model)
    def post(self):
        """Login and get JWT tokens"""
        data = request.json
        user = User.query.filter_by(email=data["email"]).first()

        if not user or not user.check_password(data["password"]):
            return {"message": "Invalid credentials"}, 401
        if not user.is_verified:
            return {"message": "Please verify your email first"}, 403

        # Include all info you want to display on frontend
        access_token = create_access_token(
            identity=str(user.id),  # simple string
            additional_claims={
                "role": user.role,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
                "mobile_number": user.mobile_number
            }
        )

        refresh_token = create_refresh_token(
            identity=str(user.id),  # same approach
            additional_claims={
                "role": user.role
            }
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "role": user.role
        }, 200

# 🔹 Refresh Token
@auth_ns.route("/refresh")
class Refresh(Resource):
    @jwt_required(refresh=True)
    def post(self):
        """Get new access token"""
        identity = get_jwt_identity()
        access_token = create_access_token(identity=identity)
        return {"access_token": access_token}, 200


# 🔹 Admin Only: Manage Users
from flask_jwt_extended import jwt_required, get_jwt
from flask import request

@admin_ns.route("/users")
class UserList(Resource):
    @jwt_required()
    def get(self):
        """Get all users (SuperAdmin only)"""
        claims = get_jwt()  # access JWT claims
        if claims.get("role") != "superadmin":
            return {"message": "Unauthorized"}, 403

        users = User.query.all()
        return [u.to_dict() for u in users], 200

    @jwt_required()
    @admin_ns.expect(register_model)
    def post(self):
        """Create a new user (SuperAdmin only)"""
        claims = get_jwt()  # access JWT claims
        if claims.get("role") != "superadmin":
            return {"message": "Unauthorized"}, 403

        data = request.json
        if User.query.filter_by(email=data["email"]).first():
            return {"message": "Email already registered"}, 400

        user = User(
            profile_picture=data.get("profile_picture"),
            first_name=data["first_name"],
            last_name=data["last_name"],
            email=data["email"],
            mobile_number=data["mobile_number"],
            role="user",
            is_verified=True  # SuperAdmin-created users don’t need OTP
        )
        user.set_password(data["password"])
        db.session.add(user)
        db.session.commit()
        return {"message": "User created successfully"}, 201



if __name__ == "__main__":
    with app.app_context():
        db.create_all()

        # Predefine SuperAdmin if not exists
        if not User.query.filter_by(role="superadmin").first():
            super_admin = User(
                first_name="Super",
                last_name="Admin",
                email="admin@system.com",
                mobile_number="0000000000",
                role="superadmin",
                is_verified=True
            )
            super_admin.set_password("Admin@123")
            db.session.add(super_admin)
            db.session.commit()
            print("SuperAdmin created: admin@system.com / Admin@123")

    app.run(debug=True)
