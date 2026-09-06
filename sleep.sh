#!/bin/bash
set -e

echo -e "\033[1;36m=============================================\033[0m"
echo -e "\033[1;36m    NotSpotify Cluster SLEEP Mode Script     \033[0m"
echo -e "\033[1;36m=============================================\033[0m"
echo -e "\033[0;37mThis will delete the Load Balancer and turn off all EC2 instances to save costs, but preserve your Database and configurations.\033[0m\n"

echo -e "\033[1;33m1. Deleting Ingress Load Balancer (Stops ELB charges)...\033[0m"
helm uninstall ingress-nginx -n ingress-nginx || true

echo -e "\n\033[1;33m2. Scaling all Kubernetes Pods to 0...\033[0m"
kubectl scale deployment --all --replicas=0 -n notspotify || true
kubectl scale statefulset --all --replicas=0 -n notspotify || true
kubectl scale deployment --all --replicas=0 -n argocd || true

echo -e "\n\033[1;33m3. Finding EKS Nodegroup name...\033[0m"
NODEGROUP=$(aws eks list-nodegroups --cluster-name notspotify-eks --region us-east-1 --query 'nodegroups[0]' --output text)
echo "Found nodegroup: $NODEGROUP"

echo -e "\n\033[1;33m4. Scaling EC2 worker nodes to 0 (Stops EC2 compute charges)...\033[0m"
aws eks update-nodegroup-config \
  --cluster-name notspotify-eks \
  --nodegroup-name "$NODEGROUP" \
  --scaling-config minSize=0,maxSize=0,desiredSize=0 \
  --region us-east-1 > /dev/null

echo -e "\n\033[1;32m=============================================\033[0m"
echo -e "\033[1;32m Cluster is now asleep! It may take 2-3 mins \033[0m"
echo -e "\033[1;32m for AWS to completely terminate the servers.\033[0m"
echo -e "\033[1;32m=============================================\033[0m"
