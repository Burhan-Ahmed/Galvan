from flask import Flask
from flask_restx import Api
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db, User
from routes.auth_routes import auth_ns
from routes.admin_routes import admin_ns
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
#CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://localhost:3000"]}}, methods=["GET","POST","PUT","DELETE","OPTIONS"])

@app.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
    return response

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///database.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "supersecretkey")

db.init_app(app)
jwt = JWTManager(app)

api = Api(app, version="1.0", title="Auth API", description="Authentication + Admin API")
api.add_namespace(auth_ns, path="/auth")
api.add_namespace(admin_ns, path="/admin")

if __name__ == "__main__":
    with app.app_context():
        db.create_all()

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
