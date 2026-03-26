data "aws_iam_policy_document" "lambda_assume_role" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "lambda" {
  name               = "${local.project}-lambda-role-${local.env}"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role.json
  tags               = local.tags
}

data "aws_iam_policy_document" "lambda_policy" {
  # CloudWatch Logs
  statement {
    actions   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["arn:aws:logs:*:*:*"]
  }

  # DynamoDB
  statement {
    actions   = ["dynamodb:GetItem", "dynamodb:PutItem", "dynamodb:UpdateItem"]
    resources = [aws_dynamodb_table.idempotency.arn]
  }

  # SQS
  statement {
    actions = [
      "sqs:SendMessage",
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes"
    ]
    resources = [
      aws_sqs_queue.orders.arn,
      aws_sqs_queue.notifications.arn
    ]
  }

  # Step Functions
  statement {
    actions   = ["states:StartExecution"]
    resources = [aws_sfn_state_machine.order_saga.arn]
  }

  # SNS
  statement {
    actions   = ["sns:Publish"]
    resources = [aws_sns_topic.order_events.arn]
  }
}

resource "aws_iam_role_policy" "lambda" {
  name   = "${local.project}-lambda-policy-${local.env}"
  role   = aws_iam_role.lambda.id
  policy = data.aws_iam_policy_document.lambda_policy.json
}
