from flask import Flask, request
from flask_restx import Api, Resource, fields
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from models import db, User
from utils import generate_otp, send_otp_email

# -----------------------
# Flask App Setup
# -----------------------
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

# Config
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db?check_same_thread=False"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "supersecretkey"

db.init_app(app)
jwt = JWTManager(app)

api = Api(app, version="1.0", title="Auth API", description="Authentication + RBAC API")

auth_ns = api.namespace("auth", description="Authentication operations")
admin_ns = api.namespace("admin", description="Admin operations")

# -----------------------
# Models
# -----------------------
register_model = api.model("Register", {
    "profile_picture": fields.String,
    "first_name": fields.String(required=True),
    "last_name": fields.String(required=True),
    "email": fields.String(required=True),
    "password": fields.String(required=True),
    "mobile_number": fields.String(required=True),
})

user_model = api.model("User", {
    "id": fields.Integer,
    "first_name": fields.String,
    "last_name": fields.String,
    "email": fields.String,
    "role": fields.String,
    "is_verified": fields.Boolean
})

# -----------------------
# Admin: List/Create Users
# -----------------------
@admin_ns.route("/users")
class UserList(Resource):
    @jwt_required()
    def get(self):
        """Get all users (SuperAdmin only)"""
        claims = get_jwt()
        if claims.get("role") != "superadmin":
            return {"message": "Unauthorized"}, 403

        users = User.query.filter(User.role != "superadmin").all()
        return [u.to_dict() for u in users], 200

    @jwt_required()
    @admin_ns.expect(register_model)
    def post(self):
        """Create a new user (SuperAdmin only)"""
        claims = get_jwt()
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
            is_verified=True
        )
        user.set_password(data["password"])
        try:
            db.session.add(user)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": "Database error", "error": str(e)}, 500

        return {"message": "User created successfully"}, 201

# -----------------------
# Admin: Get/Update/Delete User
# -----------------------
@admin_ns.route("/users/<int:user_id>")
class UserDetail(Resource):
    @jwt_required()
    def put(self, user_id):
        claims = get_jwt()
        if claims.get("role") != "superadmin":
            return {"message": "Unauthorized"}, 403

        user = db.session.get(User, user_id)  # Updated for SQLAlchemy 2.x
        if not user or user.role == "superadmin":
            return {"message": "Cannot edit this user"}, 403

        data = request.get_json()
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.email = data.get("email", user.email)
        user.mobile_number = data.get("mobile_number", user.mobile_number)

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": "Database error", "error": str(e)}, 500

        return {"message": "User updated successfully"}, 200


    @jwt_required()
    def delete(self, user_id):
        """Delete a user (SuperAdmin only)"""
        claims = get_jwt()
        if claims.get("role") != "superadmin":
            return {"message": "Unauthorized"}, 403

        user = User.query.get(user_id)
        if not user or user.role == "superadmin":
            return {"message": "Cannot delete this user"}, 403

        try:
            db.session.delete(user)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return {"message": "Database error", "error": str(e)}, 500

        return {"message": "User deleted successfully"}, 200

# -----------------------
# Run App
# -----------------------
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
