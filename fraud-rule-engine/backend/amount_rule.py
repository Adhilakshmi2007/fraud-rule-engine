from rules import FraudRule


class AmountRule(FraudRule):

    def check(self, transaction, db):
        if transaction.amount >= 100000:
            return True

        return False