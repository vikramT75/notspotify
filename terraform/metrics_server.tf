# Deploy Kubernetes Metrics Server via Helm (Required for HPA pod autoscaling)
resource "helm_release" "metrics_server" {
  name       = "metrics-server"
  repository = "https://kubernetes-sigs.github.io/metrics-server/"
  chart      = "metrics-server"
  version    = "3.12.1"
  namespace  = "kube-system"

  set {
    name  = "metrics.enabled"
    value = "true"
  }

  set {
    name  = "args[0]"
    value = "--kubelet-preferred-address-types=InternalIP"
  }

  depends_on = [
    module.eks
  ]
}
