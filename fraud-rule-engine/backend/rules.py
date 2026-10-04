from abc import ABC, abstractmethod


class FraudRule(ABC):

    @abstractmethod
    def check(self, transaction, db):
        pass