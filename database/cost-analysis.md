# AWS Cost Analysis for Pig Farm Management System

## Monthly Cost Breakdown (1000 Pigs)

### DynamoDB Costs (Mumbai Region - ap-south-1)

#### Storage Costs
- **Estimated Total Storage**: 18 MB
- **DynamoDB Storage Rate**: $0.25 per GB/month
- **Monthly Storage Cost**: 0.018 GB × $0.25 = **$0.0045** (~₹0.38)

#### Request Costs (On-Demand Pricing)
- **Read Request Units (RRU)**: $0.25 per million
- **Write Request Units (WRU)**: $1.25 per million

**Estimated Monthly Operations:**
- **Read Operations**: 100,000 (daily monitoring, reports, searches)
- **Write Operations**: 10,000 (updates, new records, stage transitions)

**Monthly Request Costs:**
- Read: 0.1 million × $0.25 = **$0.025** (~₹2.10)
- Write: 0.01 million × $1.25 = **$0.0125** (~₹1.05)

#### Global Secondary Index (GSI) Costs
- **GSI Storage**: Same rate as base table
- **GSI Operations**: Same rate as base table
- **Estimated GSI Cost**: **$0.02** (~₹1.68)

**Total DynamoDB Monthly Cost**: **$0.062** (~₹5.21)

### Lambda Function Costs

#### Function Configuration
- **Memory**: 512 MB
- **Average Duration**: 200ms per request
- **Monthly Requests**: 50,000 (API calls)

#### Lambda Pricing
- **Request Cost**: $0.20 per million requests
- **Duration Cost**: $0.0000083 per GB-second

**Monthly Lambda Costs:**
- Requests: 0.05 million × $0.20 = **$0.01** (~₹0.84)
- Duration: 50,000 × 0.2s × 0.5GB × $0.0000083 = **$0.041** (~₹3.44)

**Total Lambda Monthly Cost**: **$0.051** (~₹4.28)

### API Gateway Costs

#### API Calls
- **Monthly API Calls**: 50,000
- **API Gateway Rate**: $3.50 per million requests

**Monthly API Gateway Cost**: 0.05 million × $3.50 = **$0.175** (~₹14.70)

### S3 Storage Costs

#### Storage Requirements
- **Backup Data**: 50 MB/month
- **Application Assets**: 10 MB
- **Total Storage**: 60 MB

#### S3 Pricing (Standard)
- **Storage Rate**: $0.023 per GB/month
- **PUT Requests**: $0.005 per 1,000 requests
- **GET Requests**: $0.0004 per 1,000 requests

**Monthly S3 Costs:**
- Storage: 0.06 GB × $0.023 = **$0.0014** (~₹0.12)
- Requests: **$0.002** (~₹0.17)

**Total S3 Monthly Cost**: **$0.0034** (~₹0.29)

### CloudWatch Costs

#### Monitoring Requirements
- **Custom Metrics**: 20 metrics
- **Log Storage**: 1 GB/month
- **Dashboard**: 1 dashboard

**Monthly CloudWatch Cost**: **$0.015** (~₹1.26)

### ECS Costs (Optional - for containerized deployment)

#### Fargate Configuration
- **vCPU**: 0.25 vCPU
- **Memory**: 0.5 GB
- **Running Time**: 24/7

**Monthly ECS Cost**: **$7.50** (~₹630) - *Only if using containerized deployment*

## Total Monthly Cost Summary

### Core Services (Serverless Architecture)
| Service | Monthly Cost (USD) | Monthly Cost (INR) |
|---------|-------------------|-------------------|
| DynamoDB | $0.062 | ₹5.21 |
| Lambda | $0.051 | ₹4.28 |
| API Gateway | $0.175 | ₹14.70 |
| S3 | $0.0034 | ₹0.29 |
| CloudWatch | $0.015 | ₹1.26 |
| **Total** | **$0.306** | **₹25.74** |

### With ECS (Containerized)
| Service | Monthly Cost (USD) | Monthly Cost (INR) |
|---------|-------------------|-------------------|
| Core Services | $0.306 | ₹25.74 |
| ECS Fargate | $7.50 | ₹630.00 |
| **Total** | **$7.806** | **₹655.74** |

## Cost Optimization Strategies

### 1. DynamoDB Optimization
- **Reserved Capacity**: Save up to 76% for predictable workloads
- **Auto Scaling**: Automatically adjust capacity based on demand
- **Data Archiving**: Move old records to S3 for long-term storage

### 2. Lambda Optimization
- **Memory Tuning**: Optimize memory allocation for better price/performance
- **Connection Pooling**: Reuse database connections
- **Cold Start Reduction**: Use provisioned concurrency for critical functions

### 3. API Gateway Optimization
- **Caching**: Enable response caching to reduce backend calls
- **Request Validation**: Validate requests at the gateway level
- **Usage Plans**: Implement throttling to control costs

### 4. S3 Optimization
- **Lifecycle Policies**: Automatically transition data to cheaper storage classes
- **Intelligent Tiering**: Automatically optimize storage costs
- **Compression**: Compress backup files to reduce storage

## Scaling Projections

### 5,000 Pigs
- **DynamoDB**: $0.31 (~₹26)
- **Lambda**: $0.25 (~₹21)
- **API Gateway**: $0.87 (~₹73)
- **Total**: **$1.53** (~₹128)

### 10,000 Pigs
- **DynamoDB**: $0.62 (~₹52)
- **Lambda**: $0.51 (~₹43)
- **API Gateway**: $1.75 (~₹147)
- **Total**: **$3.06** (~₹257)

## Cost Monitoring and Alerts

### 1. Budget Setup
- Set monthly budget alerts at 80% and 100% thresholds
- Monitor costs by service and resource tags

### 2. Cost Anomaly Detection
- Enable AWS Cost Anomaly Detection
- Set up notifications for unusual spending patterns

### 3. Regular Reviews
- Weekly cost reviews during initial deployment
- Monthly cost optimization reviews
- Quarterly architecture reviews for cost efficiency

## ROI Analysis

### Traditional On-Premise Alternative
- **Server Hardware**: ₹50,000 initial + ₹5,000/month maintenance
- **Database License**: ₹30,000/year
- **IT Staff**: ₹25,000/month
- **Electricity & Infrastructure**: ₹3,000/month

**Total Traditional Cost**: ₹33,000/month

### AWS Cloud Benefits
- **99.9% Uptime SLA**
- **Automatic Scaling**
- **Built-in Security**
- **Disaster Recovery**
- **No Hardware Maintenance**
- **Pay-as-you-use Model**

**Monthly Savings**: ₹33,000 - ₹26 = **₹32,974** (99.9% cost reduction)

The cloud-based solution provides enterprise-grade infrastructure at a fraction of traditional costs while offering superior reliability, scalability, and security.