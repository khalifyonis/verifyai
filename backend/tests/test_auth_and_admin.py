import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.database import AsyncSessionLocal, engine, Base
from app.api.v1.admin_roles import seed_roles_and_permissions

@pytest.fixture(scope="session", autouse=True)
def prepare_db():
    import asyncio
    async def _setup():
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        async with AsyncSessionLocal() as session:
            await seed_roles_and_permissions(session)
    asyncio.run(_setup())
    yield

@pytest.mark.asyncio
async def test_auth_login_and_me():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Login with demo admin
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@verifai.io", "password": "verifai123"}
        )
        assert login_res.status_code == 200, login_res.text
        data = login_res.json()
        assert "access_token" in data
        assert data["user"]["email"] == "admin@verifai.io"
        token = data["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get current profile (/auth/me)
        me_res = await client.get("/api/v1/auth/me", headers=headers)
        assert me_res.status_code == 200
        me_data = me_res.json()
        assert me_data["username"] == "admin_hassan"

@pytest.mark.asyncio
async def test_public_user_registration_and_login():
    import uuid
    uid = uuid.uuid4().hex[:6]
    test_email = f"newuser_{uid}@example.com"
    test_uname = f"samir_{uid}"
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Register a new user
        reg_payload = {
            "email": test_email,
            "username": test_uname,
            "password": "Password123!",
            "full_name": "Samir Warsame",
            "country": "Somalia",
        }
        res = await client.post("/api/v1/auth/register", json=reg_payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["user"]["username"] == test_uname
        assert data["user"]["email"] == test_email
        assert "consumer" in data["user"]["roles"] or data["user"]["role"] == "consumer"

        # Login with that user
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": test_email, "password": "Password123!"}
        )
        assert login_res.status_code == 200
        assert login_res.json()["user"]["username"] == test_uname

@pytest.mark.asyncio
async def test_google_oauth_endpoint():
    import uuid
    uid = uuid.uuid4().hex[:6]
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        google_payload = {
            "google_id": f"google_{uid}",
            "email": f"athlete_{uid}@gmail.com",
            "full_name": "Liban Athlete",
            "avatar_url": "https://lh3.googleusercontent.com/a/default-user=s96-c",
        }
        res = await client.post("/api/v1/auth/google", json=google_payload)
        assert res.status_code == 200, res.text
        data = res.json()
        assert data["user"]["email"] == f"athlete_{uid}@gmail.com"
        assert data["user"]["auth_provider"] == "google"
        assert "access_token" in data

@pytest.mark.asyncio
async def test_admin_users_and_roles_management():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Login as admin
        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@verifai.io", "password": "verifai123"}
        )
        token = admin_login.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. List users
        users_res = await client.get("/api/v1/admin/users", headers=headers)
        assert users_res.status_code == 200
        users_list = users_res.json()
        assert len(users_list) >= 4

        # 2. User stats
        stats_res = await client.get("/api/v1/admin/users/stats", headers=headers)
        assert stats_res.status_code == 200
        assert stats_res.json()["total_users"] >= 4

        # 3. List roles
        roles_res = await client.get("/api/v1/admin/roles", headers=headers)
        assert roles_res.status_code == 200
        roles_list = roles_res.json()
        role_codes = [r["code"] for r in roles_list]
        assert "super_admin" in role_codes
        assert "consumer" in role_codes

        # 4. List permissions
        perms_res = await client.get("/api/v1/admin/roles/permissions", headers=headers)
        assert perms_res.status_code == 200
        perms_list = perms_res.json()
        assert len(perms_list) >= 15
