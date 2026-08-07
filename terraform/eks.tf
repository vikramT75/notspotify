module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.14"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version

  cluster_endpoint_public_access = true

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  # Grant cluster admin permissions to the IAM principal creating the cluster
  enable_cluster_creator_admin_permissions = true

  # EKS Core Add-ons
  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
    aws-ebs-csi-driver = {
      most_recent              = true
      service_account_role_arn = module.ebs_csi_irsa_role.iam_role_arn
    }
  }

  # Default EKS Managed Node Group (bootstrap nodes)
  eks_managed_node_groups = {
    initial = {
      name         = "${var.cluster_name}-nodes"
      min_size     = var.min_nodes
      max_size     = var.max_nodes
      desired_size = var.desired_nodes

      instance_types = var.node_instance_types
      capacity_type  = "ON_DEMAND"

      # Tag node groups for Karpenter auto-discovery in Phase 3
      tags = {
        "karpenter.sh/discovery" = var.cluster_name
      }
    }
  }

  # Node security group additional rules and tags for Karpenter
  node_security_group_tags = {
    "karpenter.sh/discovery" = var.cluster_name
  }

  tags = {
    "karpenter.sh/discovery" = var.cluster_name
  }
}
