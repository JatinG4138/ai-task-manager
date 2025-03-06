from fastapi import FastAPI, Depends, HTTPException, Request, Query
from starlette.middleware.sessions import SessionMiddleware
from fastapi.responses import JSONResponse
from datetime import timedelta
from services.database import get_db
from sqlalchemy.orm import Session
from models.user import User, Task, Project
from fastapi.security import HTTPBearer
from utils import verify_jwt, create_jwt_token, verify_jwt_socket
from services.oauth import oauth
import secrets, uvicorn
from services.config import settings
from schemas.schema import CreateTaskSchema, UpdateTaskStatusSchema, DeleteTaskSchema, CreateProjectSchema, UserListSchema
from fastapi_socketio import SocketManager
from fastapi.middleware.cors import CORSMiddleware
from services.openai import gemini_service
from fastapi.responses import RedirectResponse
import socketio
from jose import jwt, JWTError
import json, os

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[],
)

app = FastAPI(title='AI Task Manager')

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

socket_app = socketio.ASGIApp(sio)
app.mount("/socket.io/", socket_app)


@app.get("/auth/google")
async def login(request: Request):
    return await oauth.google.authorize_redirect(
        request,
        redirect_uri="http://localhost:8000/auth/google/callback?redirect_to=http://localhost:3000/auth-callback",
    )


@app.get("/auth/google/callback")
async def auth_google(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info or "email" not in user_info:
        raise HTTPException(status_code=400, detail="Authentication failed")

    email, name = user_info["email"], user_info.get("name")

    user = db.query(User).filter_by(email=email).first()
    if not user:
        user = User(email=email, name=name)
        db.add(user)
        db.commit()
        db.refresh(user)

    jwt_token = create_jwt_token(
        {"user_id": user.id}, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    redirect_to = request.query_params.get("redirect_to", "http://localhost:3000")

    redirection_url = f"{redirect_to}?token={jwt_token}"

    return RedirectResponse(url=redirection_url)


@app.get("/user/me")
async def get_current_user(
    # token: str,
    user_data: dict = Depends(verify_jwt),
    db: Session = Depends(get_db),
):

    try:
        user_ins = db.query(User).filter(User.id == user_data['user_id']).first()
        return {"user": user_ins}
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@app.get("/get_task")
def get_task(
    status: str = Query(None),
    project_id: str = Query(None),
    user_data: dict = Depends(verify_jwt),
    db: Session = Depends(get_db),
):

    task_ins = db.query(Task).filter(
        Task.user_id == user_data["user_id"]
    )  # user_data['user_id']

    if project_id:
        task_ins = task_ins.filter(Task.project_id == project_id)

    if status:
        task_ins = task_ins.filter(Task.status == status, Task.project_id == project_id)
    task_ins = task_ins.all()

    return JSONResponse(
        content={
            "message": "Fetched all task successfully",
            "data": [
                CreateTaskSchema.model_validate(task).model_dump(mode="json")
                for task in task_ins
            ],
        }
    )


@sio.event
async def connect(sid, environ):
    print(f"CONNECTED: {sid}")
    await sio.emit("connect_ack", {"message": "Connected successfully"}, to=sid)


@sio.event
async def disconnect(sid):
    print(f"DISCONNECTED: {sid}")


@sio.event
async def add_task(sid, data):
    db = next(get_db())

    try:
        task_data = CreateTaskSchema(**data)
        print(task_data)

        openai_response = await gemini_service.analyze_task(task_data)
        # print("responseeeeee", openai_response)
        ai_response = json.loads(openai_response)

        new_task = Task(
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            due_date=task_data.due_date,
            tag=ai_response[0],
            summary=ai_response[1],
            user_id=task_data.user_id,
            project_id=task_data.project_id,
        )
        db.add(new_task)
        db.commit()
        db.refresh(new_task)

        task_response = {
            "id": new_task.id,
            "title": new_task.title,
            "description": new_task.description,
            "status": new_task.status,
            "due_date": str(new_task.due_date),
            "tag": new_task.tag,
            "summary": new_task.summary,
        }

        await sio.emit("task_added", task_response)

    except Exception as e:
        print(f"Error adding task: {e}")
        await sio.emit("task_error", {"message": "Failed to add task"})


@sio.event
async def update_task_status(sid, data):
    db = next(get_db())

    try:
        task_data = UpdateTaskStatusSchema(**data)

        task = (
            db.query(Task)
            .filter(Task.id == task_data.task_id, Task.user_id == task_data.user_id)
            .first()
        )

        if task:
            task.status = task_data.status
            db.commit()
            db.refresh(task)

            task_response = {
                "id": task.id,
                "title": task.title,
                "status": task.status,
                "due_date": str(task.due_date),
            }

            await sio.emit("task_status_updated", task_response)
        else:
            await sio.emit("task_error", {"message": "Task not found"})

    except Exception as e:
        print(f"Error updating task status: {e}")
        await sio.emit("task_error", {"message": "Failed to update task status"})


@sio.event
async def delete_task(sid, data):
    db = next(get_db())

    try:
        task_data = DeleteTaskSchema(**data)
        user_id = task_data.user_id

        task_ins = (
            db.query(Task)
            .filter(Task.id == task_data.id, Task.user_id == user_id)
            .first()
        )

        if task_ins:
            db.delete(task_ins)
            db.commit()
            await sio.emit("task_deleted", {"task_id": task_data.id})

        else:
            await sio.emit("task_error", {"message": "Task not found"})

    except Exception as e:
        await sio.emit("task_error", {"message": f"Failed to delete task {e}"})


@app.post("/add_project")
async def add_project(
    project: CreateProjectSchema,
    user_data: dict = Depends(verify_jwt),
    db: Session = Depends(get_db),
):

    new_project = Project(
        name=project.name,
        description=project.description,
        user_id=user_data["user_id"],
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return JSONResponse(
        content={
            "message": "Added project successfully",
            "data": new_project.to_dict(),
        }
    )


# @app.get("/get_project")
# def get_project(
#     project_id: str = Query(None),
#     # user_data: dict = Depends(verify_jwt),
#     db: Session = Depends(get_db),
# ):

#     project_ins = db.query(Project).filter(Project.user_id == 1)  # user_data["user_id"]

#     if project_id:
#         project_ins = project_ins.filter(Project.id == project_id)
#     project_ins = project_ins.all()

#     return JSONResponse(
#         content={
#             "message": "Fetched all task successfully",
#             "data": [
#                 CreateProjectSchema.model_validate(project).model_dump(mode="json")
#                 for project in project_ins
#             ],
#         }
#     )


@app.get("/get_project")
def get_project(
    project_id: str = Query(None),
    user_data: dict = Depends(verify_jwt),
    db: Session = Depends(get_db),
):
    user_id = user_data["user_id"]
    project_ins = (
        db.query(Project)
        .outerjoin(
            Task, Project.id == Task.project_id
        )
        .filter(
            (Project.user_id == user_id) | (Task.user_id == user_id)
        )
        .distinct()
    )

    if project_id:
        project_ins = project_ins.filter(Project.id == project_id)

    project_ins = project_ins.all()

    return JSONResponse(
        content={
            "message": "Fetched all projects successfully",
            "data": [
                CreateProjectSchema.model_validate(project).model_dump(mode="json")
                for project in project_ins
            ],
        }
    )


@app.get("/get_all_users")
def get_all_users(
    # user_data: dict = Depends(verify_jwt),
    db: Session = Depends(get_db),
):

    user_ins = db.query(User).all()#filter(User.id != 1).all()

    return JSONResponse(
        content={
            "message": "Fetched all task successfully",
            "data": [
                UserListSchema.model_validate(user).model_dump(mode="json")
                for user in user_ins
            ],
        }
    )


if __name__ == "__app__":
    # uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
    port = int(os.getenv("PORT", 8000))  # Default to 8000 locally
    uvicorn.run(app, host="0.0.0.0", port=port)


# import os
# from fastapi import FastAPI

# app = FastAPI()


# @app.get("/")
# def read_root():
#     return {"message": "FastAPI is running!"}


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))  # Default to 8000 for local dev
    uvicorn.run(app, host="0.0.0.0", port=port)
