from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, Transaction, FraudFlag
from schemas import TransactionCreate

from velocity_rule import VelocityRule
from amount_rule import AmountRule
from geo_rule import GeoRule
from rule_engine import RuleEngine
from notification import send_high_risk_notification

app = FastAPI()


# CORS configuration for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Register fraud rules
rules = [
    VelocityRule(),
    AmountRule(),
    GeoRule()
]


# Create rule engine
rule_engine = RuleEngine(rules)


# Home endpoint
@app.get("/")
def home():
    return {
        "message": "Fraud Rule Engine API is running!"
    }


# Create transaction
@app.post("/transactions")
def create_transaction(
    transaction: TransactionCreate,
    db: Session = Depends(get_db)
):

    # Create transaction object
    new_transaction = Transaction(
        user_id=transaction.user_id,
        amount=transaction.amount,
        location=transaction.location,
        timestamp=transaction.timestamp
    )

    # Save transaction
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)


    # Run all fraud rules
    triggered_rules = rule_engine.evaluate(
        new_transaction,
        db
    )


    # Calculate risk score
    risk_score = len(triggered_rules) * 30


    # Determine risk level
    if risk_score >= 60:
        risk_level = "HIGH"

    elif risk_score >= 30:
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"
    send_high_risk_notification(
    new_transaction,
    risk_score,
    risk_level
)    


    # Save fraud flag if a rule was triggered
    if risk_score > 0:

        fraud_flag = FraudFlag(
            transaction_id=new_transaction.id,
            risk_score=risk_score,
            risk_level=risk_level,
            triggered_rules=", ".join(triggered_rules),
            status="PENDING"
        )

        db.add(fraud_flag)
        db.commit()


    # Always return transaction result
    return {
        "transaction_id": new_transaction.id,
        "user_id": new_transaction.user_id,
        "amount": new_transaction.amount,
        "location": new_transaction.location,
        "triggered_rules": triggered_rules,
        "risk_score": risk_score,
        "risk_level": risk_level
    }

@app.get("/fraud-flags")
def get_fraud_flags(
    db: Session = Depends(get_db)
):

    flags = db.query(FraudFlag).all()

    result = []

    for flag in flags:

        transaction = db.query(Transaction).filter(
            Transaction.id == flag.transaction_id
        ).first()

        result.append({
            "id": flag.id,
            "transaction_id": flag.transaction_id,
            "user_id": transaction.user_id if transaction else "Unknown",
            "amount": transaction.amount if transaction else 0,
            "location": transaction.location if transaction else "Unknown",
            "timestamp": transaction.timestamp if transaction else "Unknown",
            "risk_score": flag.risk_score,
            "risk_level": flag.risk_level,
            "triggered_rules": flag.triggered_rules,
            "status": flag.status
        })

    return result


# Update fraud flag status
@app.put("/fraud-flags/{flag_id}")
def update_fraud_flag(
    flag_id: int,
    status: str,
    db: Session = Depends(get_db)
):

    # Find fraud flag
    flag = db.query(FraudFlag).filter(
        FraudFlag.id == flag_id
    ).first()


    # If flag doesn't exist
    if not flag:
        return {
            "error": "Fraud flag not found"
        }


    # Validate status
    if status not in ["REVIEWED", "CLEARED"]:
        return {
            "error": "Status must be REVIEWED or CLEARED"
        }


    # Update status
    flag.status = status

    db.commit()
    db.refresh(flag)


    return {
        "message": "Fraud flag updated successfully",
        "flag_id": flag.id,
        "status": flag.status
    }  