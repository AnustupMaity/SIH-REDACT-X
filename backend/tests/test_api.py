import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.database import init_db

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

@pytest.mark.anyio
async def test_root_and_health():
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res = await ac.get("/")
        assert res.status_code == 200
        
        health_res = await ac.get("/health")
        assert health_res.status_code == 200
        data = health_res.json()
        assert data["status"] == "healthy"

@pytest.mark.anyio
async def test_user_registration_and_login():
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        reg_payload = {
            "first_name": "Test",
            "last_name": "User",
            "username": "testuser_api_anyio",
            "password": "secretpassword123",
            "confirm_password": "secretpassword123",
            "security_question": "What is your pet's name?",
            "security_answer": "Fluffy"
        }
        res_reg = await ac.post("/submit-form", json=reg_payload)
        assert res_reg.status_code in [201, 400]
        
        res_login = await ac.post("/login", json={
            "username": "testuser_api_anyio",
            "password": "secretpassword123"
        })
        assert res_login.status_code == 200
        token_data = res_login.json()
        assert "access_token" in token_data
        token = token_data["access_token"]
        
        res_users = await ac.get("/users", headers={"Authorization": f"Bearer {token}"})
        assert res_users.status_code == 200
        assert len(res_users.json()) >= 1

@pytest.mark.anyio
async def test_redact_endpoint_with_auth_and_history():
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        res_login = await ac.post("/login", json={
            "username": "testuser_api_anyio",
            "password": "secretpassword123"
        })
        token = res_login.json().get("access_token") if res_login.status_code == 200 else None
        headers = {"Authorization": f"Bearer {token}"} if token else {}

        redact_res = await ac.post("/redact", json={
            "text": "My email is test@domain.com and phone is +91-9876543210.",
            "redaction_level": 1
        }, headers=headers)
        assert redact_res.status_code == 200
        redacted = redact_res.json()["redacted_text"]
        assert "test@domain.com" not in redacted
        assert "+91-9876543210" not in redacted
        
        history_res = await ac.get("/history", headers=headers)
        assert history_res.status_code == 200
        history_list = history_res.json()
        assert len(history_list) >= 1
        assert any("Text Redaction" in item["operation_type"] for item in history_list)

@pytest.mark.anyio
async def test_feedback_and_retrain():
    await init_db()
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        fb_res = await ac.post("/feedback", json={
            "text": "My salary is 50000 INR",
            "redacted_text": "My salary is xxxxx INR",
            "satisfaction": "no",
            "missed_entities": ["50000 INR"],
            "corrected_text": "50000 INR",
            "redaction_level": 1
        })
        assert fb_res.status_code == 200
        assert fb_res.json()["status"] == "success"
        
        retrain_res = await ac.post("/retrain")
        assert retrain_res.status_code == 200
        assert retrain_res.json()["status"] == "success"
