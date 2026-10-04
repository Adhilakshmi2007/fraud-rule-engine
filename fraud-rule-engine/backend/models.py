from sqlalchemy import Column, Integer, String, Float
from database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String)
    amount = Column(Float)
    location = Column(String)
    timestamp = Column(String)
class FraudFlag(Base):
    __tablename__ = "fraud_flags"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer)
    risk_score = Column(Integer)
    risk_level = Column(String)
    triggered_rules = Column(String)
    status = Column(String, default="PENDING")