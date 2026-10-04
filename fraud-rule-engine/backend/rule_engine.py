class RuleEngine:

    def __init__(self, rules):
        self.rules = rules

    def evaluate(self, transaction, db):
        results = []

        for rule in self.rules:
            if rule.check(transaction, db):
                results.append(
                    rule.__class__.__name__
                )

        return results