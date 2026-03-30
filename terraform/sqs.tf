resource "aws_sqs_queue" "orders_dlq" {
  name                        = "${local.project}-orders-dlq-${local.env}.fifo"
  fifo_queue                  = true
  content_based_deduplication = false
  message_retention_seconds   = 1209600 # 14 days

  tags = local.tags
}
resource "aws_sqs_queue" "orders" {
  name                        = "${local.project}-orders-${local.env}.fifo"
  fifo_queue                  = true
  content_based_deduplication = false
  visibility_timeout_seconds  = 60 # must be greater than Lambda timeout

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.orders_dlq.arn
    maxReceiveCount     = 3
  })

  tags = local.tags
}

resource "aws_sqs_queue" "notifications" {
  name                       = "${local.project}-notifications-${local.env}"
  visibility_timeout_seconds = 30
  message_retention_seconds  = 86400 // 1 day

  tags = local.tags
}

# CloudWatch alert when DLQ has messages
resource "aws_cloudwatch_metric_alarm" "dlq_alarm" {
  alarm_name          = "${local.project}-dlq-not-empty-${local.env}"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "ApproximateNumberOfMessagesVisible"
  namespace           = "AWS/SQS"
  period              = 60
  statistic           = "Sum"
  threshold           = 0
  alarm_description   = "Orders DLQ has messages — investigate immediately"

  tags = local.tags
}

# Allow SNS to send messages to notifications SQS
resource "aws_sqs_queue_policy" "notifications" {
  queue_url = aws_sqs_queue.notifications.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "sns.amazonaws.com" }
      Action    = "sqs:SendMessage"
      Resource  = aws_sqs_queue.notifications.arn
      Condition = {
        ArnEquals = { "aws:SourceArn" = aws_sns_topic.order_events.arn }
      }
    }]
  })
}

# SNS topic -> SQS queue subscription
resource "aws_sns_topic_subscription" "notifications" {
  topic_arn = aws_sns_topic.order_events.arn
  protocol  = "sqs"
  endpoint  = aws_sqs_queue.notifications.arn
}
