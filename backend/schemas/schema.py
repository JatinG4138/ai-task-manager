from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class CreateTaskSchema(BaseModel):
    id: Optional[int] = None
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = "pending"
    tag: Optional[str] = None
    summary: Optional[str] = None
    project_id: Optional[int] = None
    user_id: Optional[int] = None
    assigned_to: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UpdateTaskStatusSchema(BaseModel):
  user_id: Optional[int] = None
  task_id: Optional[int] = None
  status: Optional[str] = None


class DeleteTaskSchema(BaseModel):
    id:int
    user_id: int


class CreateProjectSchema(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class UserListSchema(BaseModel):
    id: int
    name: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)
