# Deploy ArgoCD via official Helm Chart (GitOps Continuous Delivery)
resource "helm_release" "argocd" {
  name             = "argocd"
  repository       = "https://argoproj.github.io/argo-helm"
  chart            = "argo-cd"
  version          = "6.7.18"
  namespace        = "argocd"
  create_namespace = true

  set {
    name  = "server.service.type"
    value = "ClusterIP"
  }

  set {
    name  = "server.extraArgs"
    value = "{--insecure}" # Enables direct port-forwarding without SSL certificate warnings
  }

  depends_on = [
    module.eks
  ]
}
