from main import sio
from schemas.schema import CreateTaskSchema, DeleteTaskSchema
from models.user import Task
from services.database import get_db


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

        # Analyze task with OpenAI
        # ai_metadata = await openai_service.analyze_task(task_data)
        # print("AI Metadata:", ai_metadata)

        new_task = Task(
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            due_date=task_data.due_date,
            tag=task_data.tag,
            summary=task_data.summary,
            user_id=1,
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
