from rules import FraudRule
from models import Transaction
from datetime import datetime, timedelta


class VelocityRule(FraudRule):

    def check(self, transaction, db):

        current_time = datetime.strptime(
            transaction.timestamp,
            "%Y-%m-%d %H:%M"
        )

        start_time = current_time - timedelta(minutes=10)

        transactions = db.query(Transaction).filter(
            Transaction.user_id == transaction.user_id
        ).all()

        recent_count = 0

        for t in transactions:

            try:
                transaction_time = datetime.strptime(
                    t.timestamp,
                    "%Y-%m-%d %H:%M"
                )

                if start_time <= transaction_time <= current_time:
                    recent_count += 1

            except ValueError:
                continue

        return recent_count >= 5