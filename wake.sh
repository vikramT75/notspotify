#!/bin/bash
set -e

echo -e "\033[1;36m=============================================\033[0m"
echo -e "\033[1;36m    NotSpotify Cluster WAKE Mode Script      \033[0m"
echo -e "\033[1;36m=============================================\033[0m"
echo -e "\033[0;37mThis will turn your EC2 instances back on and restore your Load Balancer.\033[0m\n"

echo -e "\033[1;33m1. Finding EKS Nodegroup name...\033[0m"
NODEGROUP=$(aws eks list-nodegroups --cluster-name notspotify-eks --region us-east-1 --query 'nodegroups[0]' --output text)
echo "Found nodegroup: $NODEGROUP"

echo -e "\n\033[1;33m2. Turning EC2 worker nodes back on...\033[0m"
aws eks update-nodegroup-config \
  --cluster-name notspotify-eks \
  --nodegroup-name "$NODEGROUP" \
  --scaling-config minSize=1,maxSize=4,desiredSize=2 \
  --region us-east-1 > /dev/null

echo -e "\n\033[1;35mWaiting 45 seconds for AWS to boot the EC2 servers...\033[0m"
sleep 45

echo -e "\n\033[1;33m3. Waking up all Kubernetes Pods...\033[0m"
kubectl scale deployment --all --replicas=2 -n notspotify || true
kubectl scale statefulset --all --replicas=1 -n notspotify || true
kubectl scale deployment --all --replicas=1 -n argocd || true

echo -e "\n\033[1;33m4. Restoring Ingress Load Balancer...\033[0m"
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm upgrade --install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace

echo -e "\n\033[1;32m=============================================\033[0m"
echo -e "\033[1;32m Cluster is waking up! Give it ~2 minutes    \033[0m"
echo -e "\033[1;32m to finish pulling images and assigning IP.  \033[0m"
echo -e "\033[1;32m Run 'kubectl get svc -A' to check your IP.  \033[0m"
echo -e "\033[1;32m=============================================\033[0m"
