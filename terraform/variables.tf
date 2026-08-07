variable "aws_region" {
  description = "The AWS Region where resources will be created"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment (e.g. dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
  default     = "notspotify-eks"
}

variable "cluster_version" {
  description = "Kubernetes version for the EKS cluster"
  type        = string
  default     = "1.30"
}

variable "vpc_cidr" {
  description = "CIDR block for the custom VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "node_instance_types" {
  description = "EC2 instance types for the default managed node group"
  type        = list(string)
  default     = ["t3.medium"]
}

variable "desired_nodes" {
  description = "Desired number of worker nodes in the managed node group"
  type        = number
  default     = 2
}

variable "min_nodes" {
  description = "Minimum number of worker nodes in the managed node group"
  type        = number
  default     = 1
}

variable "max_nodes" {
  description = "Maximum number of worker nodes in the managed node group"
  type        = number
  default     = 4
}
