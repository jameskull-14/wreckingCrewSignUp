from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional
from datetime import datetime


class AdminUserBase(BaseModel):
    email: EmailStr
    first_name: str
    last_name: Optional[str] = None


class AdminUserCreate(AdminUserBase):
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    password: Optional[str] = Field(None, min_length=8)


class AdminUserResponse(AdminUserBase):
    admin_user_id: int
    created_on: datetime
    last_login: Optional[datetime] = None
    login_attempts: Optional[int] = 0
    locked_until: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AdminUserLogin(BaseModel):
    email: EmailStr
    password: str
