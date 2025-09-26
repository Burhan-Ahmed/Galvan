from flask import request
from flask_restx import Namespace, Resource
from flask_jwt_extended import jwt_required, get_jwt
from models import db, User
from routes.auth_routes import create_user_from_form
from flask_cors import cross_origin

admin_ns = Namespace("admin", description="Admin operations")

@admin_ns.route("/users")
class UserList(Resource):
    @jwt_required()
    def get(self):
        claims = get_jwt()
        if claims.get("role") != "superadmin":
            return {"message": "Unauthorized"}, 403
        users = User.query.all()
        return [u.to_dict() for u in users], 200

    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get("role") != "superadmin":
            return {"message": "Unauthorized"}, 403

        first_name = request.form.get("first_name")
        last_name = request.form.get("last_name")
        email = request.form.get("email")
        password = request.form.get("password")
        mobile_number = request.form.get("mobile_number")
        profile_file = request.files.get("profile_pic")

        user, err = create_user_from_form(first_name, last_name, email, password, mobile_number, profile_file, verified=True)
        if err:
            return {"message": err}, 400
        return {"message": "User created successfully"}, 201

@admin_ns.route("/users/<int:id>")
class UserDetail(Resource):
    @cross_origin(origin="http://localhost:3000", headers=["Content-Type", "Authorization"])
    @jwt_required()
    def put(self, id):
        """Update user (SuperAdmin only)"""
        claims = get_jwt()
        if claims.get("role") != "superadmin":
            return {"message": "Unauthorized"}, 403

        data = request.json
        user = User.query.get(id)
        if not user:
            return {"message": "User not found"}, 404

        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.mobile_number = data.get("mobile_number", user.mobile_number)

        db.session.commit()
        return {"message": "User updated successfully"}, 200

    @cross_origin(origin="http://localhost:3000", headers=["Content-Type", "Authorization"])
    @jwt_required()
    def delete(self, id):
        """Delete user (SuperAdmin only)"""
        claims = get_jwt()
        if claims.get("role") != "superadmin":
            return {"message": "Unauthorized"}, 403

        user = User.query.get(id)
        if not user:
            return {"message": "User not found"}, 404

        db.session.delete(user)
        db.session.commit()
        return {"message": "User deleted successfully"}, 200