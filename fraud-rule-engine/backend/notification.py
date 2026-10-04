import os
import boto3


def send_high_risk_notification(transaction, risk_score, risk_level):

    if risk_level != "HIGH":
        return

    topic_arn = os.getenv("AWS_SNS_TOPIC_ARN")

    if not topic_arn:
        print("AWS SNS not configured.")
        return

    sns = boto3.client(
        "sns",
        region_name=os.getenv(
            "AWS_REGION",
            "ap-south-1"
        )
    )

    message = f"""
HIGH RISK FRAUD ALERT

User ID: {transaction.user_id}
Transaction ID: {transaction.id}
Amount: ₹{transaction.amount}
Location: {transaction.location}
Timestamp: {transaction.timestamp}

Risk Score: {risk_score}
Risk Level: {risk_level}
"""

    sns.publish(
        TopicArn=topic_arn,
        Subject="HIGH RISK FRAUD ALERT",
        Message=message
    )

    print("High-risk notification sent.")