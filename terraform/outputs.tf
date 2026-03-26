output "orders_queue_url" {
  description = "SQS Orders queue URL"
  value       = aws_sqs_queue.orders.url
}

output "orders_dlq_url" {
  description = "SQS Orders DLQ URL"
  value       = aws_sqs_queue.orders_dlq.url
}

output "dynamodb_table_name" {
  description = "DynamoDB idempotency table name"
  value       = aws_dynamodb_table.idempotency.name
}

output "state_machine_arn" {
  description = "Step Functions state machine ARN"
  value       = aws_sfn_state_machine.order_saga.arn
}

output "api_endpoint" {
  description = "API Gateway endpoint URL"
  value       = var.is_local ? null : aws_apigatewayv2_stage.default[0].invoke_url
}