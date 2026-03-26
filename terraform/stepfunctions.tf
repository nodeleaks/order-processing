resource "aws_sns_topic" "order_events" {
  name = "${local.project}-order-events-${local.env}"
  tags = local.tags
}

resource "aws_iam_role" "step_functions" {
  name = "${local.project}-sfn-role-${local.env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "states.amazonaws.com" }
    }]
  })

  tags = local.tags
}

resource "aws_iam_role_policy" "step_functions" {
  name = "${local.project}-sfn-policy-${local.env}"
  role = aws_iam_role.step_functions.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = ["lambda:InvokeFunction"]
      Resource = [
        aws_lambda_function.reserve_inventory.arn,
        aws_lambda_function.process_payment.arn,
        aws_lambda_function.send_notification.arn,
      ]
    }]
  })
}

# SAGA State Machine
resource "aws_sfn_state_machine" "order_saga" {
  name     = "${local.project}-order-saga-${local.env}"
  role_arn = aws_iam_role.step_functions.arn

  definition = jsonencode({
    Comment = "Order processing SAGA with compensation"
    StartAt = "ReserveInventory"

    States = {
      # Step 1: Reserve product
      ReserveInventory = {
        Type     = "Task"
        Resource = aws_lambda_function.reserve_inventory.arn
        Retry = [{
          ErrorEquals     = ["Lambda.ServiceException", "Lambda.TooManyRequestsException"]
          IntervalSeconds = 2
          MaxAttempts     = 3
          BackoffRate     = 2
        }]
        Catch = [{
          ErrorEquals = ["InsufficientStockError"]
          Next        = "OrderFailed"
          ResultPath  = "$.error"
        }]
        Next = "ProcessPayment"
      }

      # Step 2: Charge amount
      ProcessPayment = {
        Type     = "Task"
        Resource = aws_lambda_function.process_payment.arn
        Retry = [{
          ErrorEquals     = ["Lambda.ServiceException"]
          IntervalSeconds = 2
          MaxAttempts     = 3
          BackoffRate     = 2
        }]
        # Compensate payment in case of failures
        Catch = [{
          ErrorEquals = ["PaymentFailedError"]
          Next        = "ReleaseInventory"
          ResultPath  = "$.error"
        }, {
          ErrorEquals = ["States.ALL"]
          Next        = "ReleaseInventory"
          ResultPath  = "$.error"
        }]
        Next = "SendConfirmation"
      }

      # Compensation: release inventory if payment failed
      ReleaseInventory = {
        Type     = "Task"
        Resource = aws_lambda_function.reserve_inventory.arn
        Parameters = {
          "orderId.$" = "$.orderId"
          action      = "RELEASE"  # Lambda distinguishes RESERVE vs RELEASE
        }
        Retry = [{
          ErrorEquals     = ["States.ALL"]
          IntervalSeconds = 2
          MaxAttempts     = 5  # compensation is critical — more attempts
          BackoffRate     = 2
        }]
        Next = "OrderFailed"
      }

      # Step 3: Send confirmation
      SendConfirmation = {
        Type     = "Task"
        Resource = aws_lambda_function.send_notification.arn
        Retry = [{
          ErrorEquals     = ["States.ALL"]
          IntervalSeconds = 5
          MaxAttempts     = 3
          BackoffRate     = 2
        }]
        Next = "OrderConfirmed"
      }

      OrderConfirmed = {
        Type = "Succeed"
      }

      OrderFailed = {
        Type  = "Fail"
        Error = "OrderFailed"
        Cause = "Order could not be processed"
      }
    }
  })

  tags = local.tags
}
