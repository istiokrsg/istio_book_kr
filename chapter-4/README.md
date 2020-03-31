---
description: Security Overview
---

# chapter-4

## 소개

이번 장에서는 Istio Service Mesh 에 필요한 보안에 대해서 소개합니다. 먼저 Istio 보안 전체 개념에 대해 설명하고, 이후 Authentication\(인증\), Authorization\(권한\), Certification\(인증서\) 사용 및 관리 방법에 대해 소개하겠습니다.

### Authentication \(인증\)

Service Mesh를 위한 TLS 상호 인증과 end-user 인증하는 방법에 대해 소개합니다.

### Authorization \(권한\)

인증된 사용자에 대해 각 서비스에 접근하기 위한 권한 제어를 방법에 대해 소개합니다.

### Plugging in existing CA Certificates \(인증서 플러그인\)

시스템 관리자가 기존 루트 인증서, 서명 인증서 및 키를 사용하여 Istio의 CA를 구성하는 방법을 소개합니다.

### Istio DNS Certificate Management \(인증서 관리\)

Istio 내부에 있는 DNS 인증서를 관리하고, 프로비저닝하는 방법에 대해 소개합니다.

## 개념

단일 애플리케이션을 원자 서비스로 분류하면 민첩성, 확장 성 및 서비스 재사용 능력이 향상되는 등 다양한 이점이 있습니다. 그러나 마이크로 서비스에는 다음과 같은 특별한 보안 요구 사항이 있습니다.

* MITM \(Man-in-the-Middle\) 공격을 방어 하려면 트래픽 암호화가 필요합니다.
* 유연한 서비스 액세스 제어를 제공하려면 상호 TLS와 세분화 된 액세스 정책이 필요합니다.
* 누가 언제 무엇을했는지 결정 하려면 감사 도구가 필요합니다.

Istio Security는 이러한 문제를 해결하기위한 포괄적 인 보안 솔루션을 제공합니다. 이 페이지는 Istio 보안 기능을 사용하여 서비스를 어디에서 실행 하든 보안을 유지하는 방법에 대한 개요를 제공합니다. 특히, Istio 보안은 데이터, 엔드 포인트, 통신 및 플랫폼에 대한 내부 및 외부 위협을 모두 완화합니다.

![Security Overview](../.gitbook/assets/image-13.png)

Istio 보안 기능은 강력한 ID, 강력한 정책, 투명한 TLS 암호화 및 AAA \(인증, 권한 부여 및 감사\) 도구를 제공하여 서비스와 데이터를 보호합니다. Istio 보안의 목표는 다음과 같습니다.

* 기본적으로 보안 : 애플리케이션 코드 및 인프라를 변경할 필요가 없습니다.
* 심층 방어 : 기존 보안 시스템과 통합하여 여러 계층의 방어를 제공합니다.
* 제로 트러스트 네트워크 : 비 신뢰 네트워크에 보안 솔루션 구축

## High-level Architecture

Istio의 보안에는 여러 구성 요소가 포함됩니다.

* 키 및 인증 관리를위한 인증 기관 \(CA\)
* 구성 API 서버는 프록시에 분배합니다.
  * Authentication Policies
  * Authorization Policies
  * Secure Naming Information
* sidecar 및 perimeter 프록시는 클라이언트와 서버 간의 통신을 보호하기 위해 PEP \(Policy Enforcement Point\)로 작동합니다.
* 원격 분석 및 감사를 관리하기위한 Envoy 프록시 확장 세트

Control Plane은 API 서버의 구성을 처리하고 Data Plane 에서 PEP를 구성합니다. PEP는 Envoy를 사용하여 구현됩니다. 다음 다이어그램은 아키텍처를 보여줍니다.

![Security Architecture](../.gitbook/assets/image-19.png)

이어지는 다음 장에서 istio 보안 주요기능에 대해 더 자세히 소개하겠습니다.

## Istio Identity

ID는 모든 보안 인프라의 기본 개념입니다. 워크로드-워크로드 간 통신 시작시 두 당사자는 상호 인증을 위해 신원 정보와 신임 정보를 교환해야합니다. 클라이언트 측에서 서버의 ID는 안전한 이름 지정 정보와 비교하여 서버가 워크로드의 승인 된 실행자인지 확인합니다. 서버 측에서 서버는 권한 부여 정책을 기반으로 클라이언트가 액세스 할 수있는 정보를 결정하고, 몇시에 액세스했는지 감사하고, 사용한 워크로드에 따라 클라이언트를 청구하며, 청구서에 액세스하지 못한 클라이언트를 거부 할 수 있습니다. 작업량.

Istio ID 모델은 일류 서비스 ID를 사용하여 요청 출처의 ID를 결정합니다. 이 모델을 통해 서비스 아이덴티티가 사람 사용자, 개별 워크로드 또는 워크로드 그룹을 나타낼 수있는 뛰어난 유연성과 세분성을 제공 할 수 있습니다. 서비스 ID가없는 플랫폼에서 Istio는 서비스 이름과 같은 워크로드 인스턴스를 그룹화 할 수있는 다른 ID를 사용할 수 있습니다.

다음 목록은 다른 플랫폼에서 사용할 수있는 서비스 ID의 예를 보여줍니다.

* Kubernetes: Kubernetes 서비스 계정
* GKE/GCE: GCP 서비스 계정
* GCP: GCP 서비스 계정
* AWS: AWS IAM user/role 계정
* On-Premise \(non-kubernetes\) : 사용자 계정, 사용자 지정 서비스 계정, 서비스 이름, Istio 서비스 계정 또는 GCP 서비스 계정 사용자 정의 서비스 계정은 고객의 Identity Directory에서 관리하는 아이디와 같은 기존 서비스 계정을 나타냅니다.

## Public Key Infrastructure \(PKI\)

Istio PKI는 X.509 인증서를 사용하여 모든 워크로드에 강력한 ID를 안전하게 프로비저닝합니다. PKI는 규모에 따라 키 및 인증서 순환을 자동화하기 위해 인증서 및 키 프로비저닝을 위해 각 Envoy 프록시와 함께 Istio 에이전트를 실행합니다. 다음 다이어그램은 자격 증명 제공 흐름을 보여줍니다.

![Identity Provision](../.gitbook/assets/image-9.png)

Istio는 다음 흐름을 사용하여 비밀 검색 서비스 SDS\(Secret Discovery Service\) 를 통해 ID를 제공합니다.

1. CA는 인증서 서명 요청 \(CSR\)을 수행하기 위해 gRPC 서비스를 제공합니다. 
2. Envoy는 Envoy 비밀 검색 서비스 \(SDS\) API를 통해 인증서와 키 요청을 보냅니다. 
3. SDS 요청을 수신하면 Istio 에이전트는 서명을 위해 자격 증명이있는 CSR을 Istio CA에 보내기 전에 개인 키와 CSR을 만듭니다.
4. CA는 CSR에 포함 된 자격 증명의 유효성을 검사하고 CSR에 서명하여 인증서를 생성합니다.
5. Istio 에이전트는 Envoy SDS API를 통해 Istio CA로부터받은 인증서와 개인 키를 Envoy에 보냅니다.
6. 위의 CSR 프로세스는 인증서 및 키 순환을 위해 주기적으로 반복됩니다.

