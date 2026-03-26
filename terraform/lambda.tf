locals {
  lambda_env = {
    NODE_ENV                       = local.env
    IS_LOCAL                       = var.is_local ? "true" : "false"
    DYNAMODB_TABLE_IDEMPOTENCY     = aws_dynamodb_table.idempotency.name
    SQS_ORDERS_QUEUE_URL           = aws_sqs_queue.orders.url
    SQS_NOTIFICATIONS_QUEUE_URL    = aws_sqs_queue.notifications.url
    SNS_ORDER_EVENTS_ARN           = aws_sns_topic.order_events.arn
    DATABASE_URL                   = var.database_url
  }
}

# API Lambda — Hono app (entry point)
resource "aws_lambda_function" "api" {
  function_name = "${local.project}-api-${local.env}"
  filename      = var.lambda_zip_path
  handler       = "dist/lambda.handler"
  runtime       = "nodejs22.x"
  role          = aws_iam_role.lambda.arn
  timeout       = 30
  memory_size   = 512

  environment {
    variables = merge(local.lambda_env, {
      STEP_FUNCTIONS_ORDER_SAGA_ARN = aws_sfn_state_machine.order_saga.arn
    })
  }

  tags = local.tags
}

# Payment Lambda
resource "aws_lambda_function" "process_payment" {
  function_name = "${local.project}-process-payment-${local.env}"
  filename      = var.lambda_zip_path
  handler       = "dist/handlers/processPayment.handler"
  runtime       = "nodejs22.x"
  role          = aws_iam_role.lambda.arn
  timeout       = 30
  memory_size   = 256

  environment {
    variables = local.lambda_env
  }

  tags = local.tags
}

# Inventory Lambda
resource "aws_lambda_function" "reserve_inventory" {
  function_name = "${local.project}-reserve-inventory-${local.env}"
  filename      = var.lambda_zip_path
  handler       = "dist/handlers/reserveInventory.handler"
  runtime       = "nodejs22.x"
  role          = aws_iam_role.lambda.arn
  timeout       = 15
  memory_size   = 256

  environment {
    variables = local.lambda_env
  }

  tags = local.tags
}

# Notification Lambda
resource "aws_lambda_function" "send_notification" {
  function_name = "${local.project}-send-notification-${local.env}"
  filename      = var.lambda_zip_path
  handler       = "dist/handlers/sendNotification.handler"
  runtime       = "nodejs22.x"
  role          = aws_iam_role.lambda.arn
  timeout       = 15
  memory_size   = 128

  environment {
    variables = local.lambda_env
  }

  tags = local.tags
}

# SQS trigger для notification Lambda
resource "aws_lambda_event_source_mapping" "notifications" {
  event_source_arn = aws_sqs_queue.notifications.arn
  function_name    = aws_lambda_function.send_notification.arn
  batch_size       = 10
}

# API Gateway v2
resource "aws_apigatewayv2_api" "main" {
  count         = var.is_local ? 0 : 1
  name          = "${local.project}-api-${local.env}"
  protocol_type = "HTTP"
  tags          = local.tags
}

resource "aws_apigatewayv2_integration" "lambda" {
  count              = var.is_local ? 0 : 1
  api_id             = aws_apigatewayv2_api.main[0].id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.api.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "default" {
  count     = var.is_local ? 0 : 1
  api_id    = aws_apigatewayv2_api.main[0].id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda[0].id}"
}

resource "aws_apigatewayv2_stage" "default" {
  count       = var.is_local ? 0 : 1
  api_id      = aws_apigatewayv2_api.main[0].id
  name        = "$default"
  auto_deploy = true
  tags        = local.tags
}

resource "aws_lambda_permission" "apigw" {
  count         = var.is_local ? 0 : 1
  statement_id  = "AllowAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main[0].execution_arn}/*/*"
}
