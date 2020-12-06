# Kubernetes 소개

## Kubernetes 

Kubernetes는 컨테이너 기반 애플리케이션과 관련 네트워킹 및 스토리지 구성 요소를 관리하는 플랫폼으로서 빠르게 진화하고 있습니다. 기본 인프라 구성 요소가 아니라 애플리케이션 워크로드에 중점을 두고 있습니다. Kubernetes는 관리 작업을 위한 강력한 API 집합을 통해 지원되는 선언적 배포 방식을 제공합니다.

Kubernetes에서 이러한 애플리케이션 구성 요소의 가용성을 오케스트레이션하고 관리하는 데 도움이 되는 최신의 이식 가능한 마이크로 서비스 기반 애플리케이션을 구축하고 실행할 수 있습니다. Kubernetes는 팀에서 마이크로 서비스 기반 애플리케이션의 채택을 통해 진행함에 따라 상태 비저장 및 상태 저장 애플리케이션을 모두 지원합니다.

오픈 플랫폼인 Kubernetes를 사용하면 기본 설정 프로그래밍 언어, OS, 라이브러리 또는 메시지 버스를 사용하여 애플리케이션을 빌드할 수 있습니다. 기존의 CI/CD\(지속적인 통합 및 지속적인 업데이트\) 도구는 Kubernetes와 통합되어 릴리스를 예약하고 배포할 수 있습니다.

AKS\(Azure Kubernetes Service\)는 업그레이드 조정을 포함하여 배포 및 핵심 관리 작업의 복잡성을 줄여 주는 관리되는 Kubernetes 서비스를 제공합니다. AKS 제어 평면은 Azure 플랫폼에서 관리 하며 응용 프로그램을 실행 하는 AKS 노드에 대해서만 비용을 지불 합니다. AKS은 오픈 소스 Azure Kubernetes 서비스 엔진 \([AKS](https://github.com/Azure/aks-engine)\)을 기반으로 빌드됩니다.

## AKS 아키텍처

p.220 \(그림 7.1\)

p.64 \(그림 4.4\)

![](../../../.gitbook/assets/image%20%286%29.png)

### Master

Master는 API Server,  Scheduler, kubelet, Controller Manager 등 클러스터 전체를 관리하기 위한 여러개의 컴포넌트로 구성되어 있습니다. 클러스터 안에 있는 여러 노드들의 리소스 정보와  그 안에서 동작하는 컨테이너들의 상태를 관리하기 위한 모든 정보들을 관리하고 제어하는 역할을 담당합니다.

#### API Server

kube-apiserver는 쿠버네티스 클러스터의 리소스 정보를 관리하기 위한 REST API 를 제공하는 프로세스입니다. kubectl 또는 쿠버네티스 대시보드와 같은 관리도구에서 클러스터를 제어하기 위한 모든 요청은 kube-apiserver를 통해서 다른 곳으로 전달되도록 되어 있습니다. 또한 클러스터로 API 요청이 왔을때 해당 요청의 유효성을 검증하는 역할을 담당합니다. kube-apiserver는 scale-out\(수평확장\) 을 통해 여러 개의 컨테이너를 실행할 수 있습니다. 

#### etcd

etcd 는 간단한 쿠버네트스 클러스터의 상태 정보를 key, value 형식으로 저장하기 위한 분산 KVS\(Key Value Storage\) 입니다.

#### Scheduler

Scheduler는 Pod를 어느 노드에서 동작시킬지를 제어하기 위한 컴포넌트 입니다. kube-apiserver 를 통해 새로운 Pod 들이 생성될 때, 현재 클러스터내에서 자원할당이 가능한 노드들 중에서 적절한 노드를 선택하여 Pod 를 생성하는 스케쥴링 역할을 담당합니다. Pod를 스케쥴링 하기 위한 다양한 조건이 있는데, 그 중 Pod를 배포하여 동작하기 위한 최소한의 하드웨어 리소스 조건\(cpu core, memory\) 이 충족되는 특정 노드에만 배포할 수 있으며, Affinity/Anti-Affinity 설정을 통해 원하는 라벨리이 된 노드에만 배포하도록 스케쥴링 가능합니다.

#### Controller Manager

Controller Manager 는 쿠버네티스 클러스터의 상태를 감시하고, 클러스터의 본래 되어야 할 상태를 유지하도록 하는 컴포넌트 입니다. Controller Manager는 kube-apiserver API 호출을 통해 etcd 에 저장되어있는 클러스터의 상태를 주기적으로 감시하고, 현재의 상태가 다를 경우 이를 감지하여 복원하는 기능을 담당합니다.

#### DNS

쿠버네티스 클러스터에 배포되는 모든 서비스에 접근하기 위한 end-point URL은 내부 DNS 서버를 통해 맵핑하여 관리합니다. 클러스터에 새로운 Pod 또는 Service 를 배포하면 동적 IP를 할당받고, 재배포 또는 Re-Scheduling 에 의해 IP 가 변경될 수 있기 때문에, 해당 서비스에 접근하기 위한 위치 정보가 필요합니다. 쿠버네티스는 이러한 구조에서 Service Discovery 하기 위해 내부 DNS 서비스를 제공하여, 서비스 이름으로 해당 서비스에 접근할 수 있도록 DNS resolve 기능을 제공합니다.

### Node

노드는 Pod 가 동작하는 서버 입니다. 실제로 컨테이너 애플리케이션을 실행하여 서비스를 제공합니다. 보통 노드를 여러대 구성하여 하나의 클러스터로 운영하여 가용성을 높이고, Node 스케일링을 통해 클러스터의 사이즈를 확장 할 수 있습니다. 보통 Public Cloud 환경에서 Node는 VM 형태로 제공되며, On-Premise 환경에서는 Bare Metal 서버를 쿠버네티스 클러스터 노드로 활용할 수도 있습니다.

#### kubelet

Node 안에는 kubelet 에이전트가 실행되고 있습니다. kubelet 은 kube-apiserver, scheduler 를 통해 Pod 정의 파일\(CRD\)에 따라 컨테이너를 실행하거나, 스토리지 공간을 마운트 합니다. 또한 kubelet은 Node의 상태 정보를 주기적으로 모니터링 하여 API Server 에게 보고하고, etcd 에 저장하도록 합니다. 

#### kube-proxy

Node로 들어오는 네트워크 트래픽을 적절한 컨테이너로 라우팅하고, 로드밸런싱 등 Node에서 발생하는 in/out bound 네트워크 트래픽을 프록시하고, Node 와 Master 간의 네트워크 통신을 관리합니다.



Ref

* [https://github.com/Azure/kubernetes-hackfest/blob/master/labs/create-aks-cluster/README.md](https://github.com/Azure/kubernetes-hackfest/blob/master/labs/create-aks-cluster/README.md)
* [https://docs.microsoft.com/ko-kr/azure/aks/concepts-clusters-workloads](https://docs.microsoft.com/ko-kr/azure/aks/concepts-clusters-workloads)
* [https://docs.microsoft.com/ko-kr/azure/aks/intro-kubernetes](https://docs.microsoft.com/ko-kr/azure/aks/intro-kubernetes)

