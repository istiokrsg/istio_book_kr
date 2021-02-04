# AKS

AKS\(Azure Kubernetes Service\)를 사용하면 Azure에서 관리되는 Kubernetes 클러스터를 간단하게 배포할 수 있습니다. AKS는 대부분의 부담을 Azure에 오프로딩하여 Kubernetes를 관리하는 복잡성 및 운영 과부하를 감소시킵니다. 호스팅되는 Kubernetes 서비스인 Azure는 상태 모니터링 및 유지 관리 같은 중요 작업을 처리합니다. Kubernetes 마스터는 Azure에서 관리됩니다. 에이전트 노드만 관리하고 유지하면 됩니다. 관리되는 Kubernetes 서비스, AKS가 무료이므로 마스터가 아니라 클러스터 내의 에이전트 노드에 대해서만 지불합니다.

Azure CLI 또는 Resource Manager 템플릿 및 Terraform과 같은 템플릿 기반 배포 옵션을 사용하여 Azure Portal에서 AKS 클러스터를 만들 수 있습니다. AKS 클러스터를 배포할 때 Kubernetes 마스터 및 모든 노드가 배포되고 구성됩니다. 배포 프로세스 중에 고급 네트워킹, Azure Active Directory 통합 및 모니터링 등의 추가 기능을 구성할 수도 있습니다. Windows Server 컨테이너는 AKS에서 지원됩니다.

