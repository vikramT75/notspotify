#!/bin/bash

echo -e "\033[1;36m=============================================\033[0m"
echo -e "\033[1;36m     NotSpotify Cluster Tear-Down Script     \033[0m"
echo -e "\033[1;36m=============================================\033[0m"
echo ""

echo -e "\033[1;33m1. Uninstalling Ingress-Nginx...\033[0m"
echo -e "\033[0;37m   (This destroys the AWS Elastic Load Balancer so VPC can be deleted cleanly)\033[0m"
helm uninstall ingress-nginx -n ingress-nginx

echo -e "\n\033[1;35mWaiting 45 seconds for AWS ELB and ENIs to be fully detached and deleted...\033[0m"
sleep 45

echo -e "\n\033[1;33m2. Uninstalling ArgoCD and NotSpotify...\033[0m"
helm uninstall argocd -n argocd || true
helm uninstall notspotify -n notspotify || true
kubectl delete namespace argocd || true
kubectl delete namespace notspotify || true

echo -e "\n\033[1;33m3. Deleting Persistent Volume Claims...\033[0m"
echo -e "\033[0;37m   (This cleans up any lingering AWS EBS volumes)\033[0m"
kubectl delete pvc --all -A || true

echo -e "\n\033[1;33m4. Destroying Terraform infrastructure...\033[0m"
cd terraform
terraform destroy -auto-approve
cd ..

echo -e "\n\033[1;32m=============================================\033[0m"
echo -e "\033[1;32m Tear-down complete! No lingering resources. \033[0m"
echo -e "\033[1;32m=============================================\033[0m"
