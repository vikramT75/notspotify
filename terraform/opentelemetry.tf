# 1. Deploy Cert-Manager (Required for OpenTelemetry Operator Webhooks)
resource "helm_release" "cert_manager" {
  name             = "cert-manager"
  repository       = "https://charts.jetstack.io"
  chart            = "cert-manager"
  version          = "v1.14.4"
  namespace        = "cert-manager"
  create_namespace = true

  set {
    name  = "installCRDs"
    value = "true"
  }

  depends_on = [
    module.eks
  ]
}

# 2. Deploy OpenTelemetry Operator via Helm
resource "helm_release" "opentelemetry_operator" {
  name             = "opentelemetry-operator"
  repository       = "https://open-telemetry.github.io/opentelemetry-helm-charts"
  chart            = "opentelemetry-operator"
  version          = "0.57.0"
  namespace        = "opentelemetry-operator-system"
  create_namespace = true

  set {
    name  = "manager.collectorImage.repository"
    value = "otel/opentelemetry-collector-k8s"
  }

  depends_on = [
    helm_release.cert_manager
  ]
}
