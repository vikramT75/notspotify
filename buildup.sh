#!/bin/bash
set -e

echo -e "\033[1;36m=============================================\033[0m"
echo -e "\033[1;36m      NotSpotify Cluster Build-Up Script     \033[0m"
echo -e "\033[1;36m=============================================\033[0m"
echo ""

echo -e "\033[1;33m1. Initializing and Applying Terraform Infrastructure...\033[0m"
cd terraform
terraform init
terraform apply -auto-approve
cd ..

echo -e "\n\033[1;33m2. Updating local kubeconfig...\033[0m"
aws eks update-kubeconfig --region us-east-1 --name notspotify-eks

echo -e "\n\033[1;33m3. Applying Cloudinary Secrets...\033[0m"
kubectl apply -f k8s/cloudinary-secret.yaml

echo -e "\n\033[1;33m4. Installing Ingress-Nginx Load Balancer...\033[0m"
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace

echo -e "\n\033[1;33mWaiting 15 seconds for Ingress Controller to spin up...\033[0m"
sleep 15

echo -e "\n\033[1;33m5. Installing ArgoCD...\033[0m"
helm repo add argo https://argoproj.github.io/argo-helm
helm repo update
helm upgrade --install argocd argo/argo-cd --namespace argocd --create-namespace --set server.service.type=ClusterIP --set server.extraArgs="{--insecure}"

echo -e "\n\033[1;33m6. Deploying NotSpotify via ArgoCD...\033[0m"
if [ -f "k8s/argocd/application.yaml" ]; then
    kubectl apply -f k8s/argocd/application.yaml
else
    echo -e "\033[1;35mCould not find k8s/argocd/application.yaml, falling back to direct Helm deployment...\033[0m"
    helm upgrade --install notspotify ./helm/notspotify --namespace notspotify --create-namespace
fi

echo -e "\n\033[1;32m=============================================\033[0m"
echo -e "\033[1;32m   Build complete! Cluster is spinning up!   \033[0m"
echo -e "\033[1;32m=============================================\033[0m"
