from rules import FraudRule
from models import Transaction
from datetime import datetime


class GeoRule(FraudRule):

    def check(self, transaction, db):

        locations = {
            "Chennai": (13.0827, 80.2707),
            "Delhi": (28.6139, 77.2090),
            "Mumbai": (19.0760, 72.8777),
            "Bangalore": (12.9716, 77.5946),
            "Hyderabad": (17.3850, 78.4867)
        }

        if transaction.location not in locations:
            return False

        current_location = locations[transaction.location]

        previous_transactions = db.query(Transaction).filter(
            Transaction.user_id == transaction.user_id
        ).order_by(Transaction.id.desc()).all()

        for previous in previous_transactions:

            if previous.id == transaction.id:
                continue

            if previous.location not in locations:
                continue

            try:
                previous_time = datetime.strptime(
                    previous.timestamp,
                    "%Y-%m-%d %H:%M"
                )

                current_time = datetime.strptime(
                    transaction.timestamp,
                    "%Y-%m-%d %H:%M"
                )

            except ValueError:
                continue

            time_difference = abs(
                (current_time - previous_time).total_seconds()
            ) / 3600

            previous_location = locations[previous.location]

            latitude_difference = abs(
                current_location[0] - previous_location[0]
            )

            longitude_difference = abs(
                current_location[1] - previous_location[1]
            )

            distance = (
                (latitude_difference ** 2 +
                 longitude_difference ** 2) ** 0.5
            ) * 111

            # More than 500 km within 1 hour = impossible travel
            if distance > 500 and time_difference < 1:
                return True

        return False