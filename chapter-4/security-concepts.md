# 5.2 Security Architecture

## Security

모노리식\(monolithic\) 애플리케이션을 원자 서비스로 분해하면 민첩성 향상, 확장성 향상, 서비스 재사용 능력 향상 등 다양한 이점이 제공됩니다. 그러나 마이크로 서비스에는 특정 보안 요구 사항이 필요합니다.

* MITM\(man-in-the-middle\) 공격을 방어하기 위해서는 네트워크 구간별 트래픽 암호화가 필요합니다.
* 유연한 서비스 접근제어를 제공하려면 상호 TLS 및 세분화 된 액세스 정책이 필요합니다.
* 누가 언제 무엇을 했는지 확인하려면 감사 도구가 필요합니다.

Istio Security는 이러한 문제를 해결하기위한 포괄적 인 보안 솔루션을 제공합니다. 이 페이지에서는 Istio 보안 기능을 사용하여 어디에서 실행하든 서비스를 보호하는 방법에 대한 개요를 제공합니다. 특히 Istio 보안은 데이터, 엔드 포인트, 통신 및 플랫폼에 대한 내부 및 외부 위협을 모두 완화합니다.

![Security Overview](../.gitbook/assets/image%20%281%29.png)

Istio 보안 기능은 강력한 ID, 강력한 정책, 투명한 TLS 암호화, 인증, 권한 부여 및 감사 \(AAA\) 도구를 제공하여 서비스와 데이터를 보호합니다. Istio 보안의 목표는 다음과 같습니다.

* 기본 보안 : 애플리케이션 코드 및 인프라를 변경할 필요가 없습니다.
* 심층 방어 : 기존 보안 시스템과 통합하여 다중 방어 계층 제공
* 제로 트러스트 네트워크: 신뢰할 수없는 네트워크에 보안 솔루션 구축

## High Level Architecture

Istio 보안에는 여러 컴포넌트를 포함하고 있습니다.

* 키 및 인증서 관리를위한 CA \(인증 기관\)
* Configuration API 서버는 Proxy 에 배포
  * 인증 정책
  * 권한 정책
  * 안전한 보안 이름 정책
* 사이드카 및 경계 프록시는 클라이언트와 서버 간의 통신을 보호하기위한 정책 적용 지점 \(PEP\)으로 작동.
* 원격 측정 및 감사를 관리하기위한 Envoy 프록시 확장 세트

제어 플레인은 API 서버의 구성을 처리하고 데이터 플레인에서 PEP를 구성합니다. PEP는 Envoy를 사용하여 구현됩니다. 다음 다이어그램은 아키텍처를 보여줍니다.

![Security Architecture](../.gitbook/assets/image%20%2839%29.png)

_**자세한 설명은  security feature 에서 설명**_

_\*\*\*\*_

## Istio Identity

ID는 모든 보안 인프라의 기본 개념입니다. 작업 부하 간 통신을 시작할 때 두 당사자는 상호 인증을 위해 자격 증명을 자신의 ID 정보와 교환해야합니다. 클라이언트 측에서는 안전한 이름 지정 정보와 비교하여 서버의 ID를 확인하여 워크로드의 승인 된 실행자인지 확인합니다. 서버 측에서 서버는 권한 부여 정책에 따라 클라이언트가 액세스 할 수있는 정보를 결정하고, 누가 언제 무엇에 액세스했는지 감사하고, 사용한 워크로드에 따라 클라이언트에게 요금을 부과하고, 요금을 지불하지 못한 클라이언트의 액세스를 거부 할 수 있습니다.

Istio ID 모델은 first-class 서비스 ID를 사용하여 요청 출처의 ID를 확인합니다. 이 모델은 사용자, 개별 워크로드 또는 워크로드 그룹을 나타내는 서비스 ID에 대한 뛰어난 유연성과 세분성을 허용합니다. 서비스 ID가없는 플랫폼에서 Istio는 서비스 이름과 같은 워크로드 인스턴스를 그룹화 할 수있는 다른 ID를 사용할 수 있습니다.

다음 목록은 다양한 플랫폼에서 사용할 수있는 서비스 ID의 예를 보여줍니다.

* Kubernetes : Kubernetes 서비스 계정
* GKE / GCE : GCP 서비스 계정
* GCP : GCP 서비스 계정
* AWS : AWS IAM 사용자 / 역할 계정
* On-Premise \(Non-Kubernetes\) : 사용자 계정, 커스텀 서비스 계정, 서비스 이름, Istio 서비스 계정 또는 GCP 서비스 계정. 커스텀 서비스 계정은 고객의 ID 디렉토리가 관리하는 ID와 마찬가지로 기존 서비스 계정을 참조합니다.

## Identity and Certificate Management

Istio는 X.509 인증서를 사용하여 모든 워크로드에 강력한 ID를 안전하게 프로비저닝합니다. 각 Envoy 프록시와 함께 실행되는 Istio 에이전트는 istiod와 함께 작동하여 대규모 키 및 인증서 순환을 자동화합니다. 다음 다이어그램은 ID 프로비저닝 흐름을 보여줍니다.

![Identity Provision](../.gitbook/assets/image%20%2838%29.png)

Istio는 아래와 같은 과정을 통해 SDS\(secret discovery service\) 비밀 검색 서비스를 통해 ID를 프로비저닝합니다.

1. istiod는 CSR\(Certificate Signing Request\) 인증서 서명 요청을 받을 수있는 gRPC 서비스를 제공합니다.
2. Envoy는 Envoy SDS API를 통해 인증서 및 키 요청을 보냅니다.
3. SDS 요청을 수신하면 Istio 에이전트는 인증서와 함께 CSR을 서명을 위해 istiod로 보내기 전에 개인 키와 CSR을 생성합니다.
4. CA는 CSR에 포함 된 자격 증명의 유효성을 검사하고 CSR에 서명하여 인증서를 생성합니다.
5. Istio 에이전트는 istiod 에서받은 인증서와 개인 키를 Envoy SDS API를 통해 Envoy로 보냅니다.
6. 위의 CSR 프로세스는 인증서 및 키 교체를 위해 주기적으로 반복됩니다.

## Authentication

Istio는 두 가지 유형의 인증을 제공합니다.

* Peer Authentication : 연결하는 클라이언트를 확인하기 위해 서비스 간 인증에 사용됩니다. Istio는 서비스 코드 변경없이 활성화 할 수있는 전송 인증을위한 풀 스택 솔루션으로 상호 TLS를 제공합니다.
  * 각 서비스에 역할을 나타내는 강력한 ID를 제공하여 클러스터와 클라우드에서 상호 운용성을 지원합니다.
  * 서비스 간 통신을 보호합니다.
  * 키 및 인증서 생성, 배포 및 순환을 자동화하는 키 관리 시스템을 제공합니다.
* 요청 인증 : 요청에 첨부 된 자격 증명을 확인하기 위해 최종 사용자 인증에 사용됩니다. Istio는 JWT \(JSON Web Token\) 유효성 검사로 요청 수준 인증을 지원하고 사용자 지정 인증 공급자 또는 OpenID Connect 공급자를 사용하여 간소화 된 개발자 환경을 제공합니다. 예를 들면 다음과 같습니다.

  * ORY Hydra
  * Keycloak
  * AuthO
  * Firebase Auth
  * Google Auth

모든 경우에 Istio는 사용자 지정 Kubernetes API를 통해 Istio 구성 저장소에 인증 정책을 저장합니다. Istiod는 해당하는 경우 키와 함께 각 프록시에 대해 최신 상태로 유지합니다. 또한 Istio는 허용 모드의 인증을 지원하여 정책 변경이 적용되기 전에 보안 상태에 미치는 영향을 이해하는데 도움이 됩니다.



### Mutual TLS Authentication

Istio는 Envoy 프록시로 구현되는 클라이언트 및 서버 측 PEP를 통해 서비스 간 통신을 터널링합니다. 워크로드가 상호 TLS 인증을 사용하여 다른 워크로드에 요청을 보낼 때 요청은 다음과 같이 처리됩니다.

1. Istio는 클라이언트에서 클라이언트의 로컬 사이드카 Envoy로 아웃 바운드 트래픽을 다시 라우팅합니다.
2. 클라이언트 측 Envoy는 서버 측 Envoy와 상호 TLS 핸드 셰이크를 시작합니다. 핸드 셰이크 중에 클라이언트 측 Envoy는 보안 이름 지정 검사를 수행하여 서버 인증서에 제공된 서비스 계정이 대상 서비스를 실행할 권한이 있는지 확인합니다.
3. 클라이언트 측 Envoy와 서버 측 Envoy는 상호 TLS 연결을 설정하고 Istio는 클라이언트 측 Envoy에서 서버 측 Envoy로 트래픽을 전달합니다.
4. 승인 후 서버 측 Envoy는 로컬 TCP 연결을 통해 트래픽을 서버 서비스로 전달합니다.

### Permissive Mode

Istio 상호 TLS에는 허용 모드를 이용하여 서비스가 암호화 되지 않는 평문 트래픽과 암호화된 상호 TLS 트래픽을 동시에 수락 할 수 있습니다. 이 기능은 상호 TLS 온 보딩 경험을 크게 향상시킵니다.

non-Istio 서버와 통신하는 많은 non-Istio 클라이언트는 상호 TLS가 활성화 된 상태에서 해당 서버를 Istio로 마이그레이션하려는 운영자에게는 문제가 될 수 있습니다. 일반적으로 운영자는 모든 클라이언트에 대해 Istio 사이드카를 동시에 설치할 수 없거나 일부 클라이언트에서 이를 수행 할 수있는 권한도 없습니다. 서버에 Istio 사이드카를 설치 한 후에도 운영자는 기존 통신을 중단 없이 상호 TLS를 활성화 할 수 없습니다.

허용 모드가 활성화되면 서버는 평문  및 상호 TLS 트래픽을 모두 허용합니다. 이 모드는 온 보딩 프로세스에 더 큰 유연성을 제공합니다. 서버에 설치된 Istio 사이드카는 기존 평문 트래픽을 중단하지 않고 상호 TLS 트래픽을 즉시 가져옵니다. 결과적으로 운영자는 클라이언트의 Istio 사이드카를 점진적으로 설치하고 구성하여 상호 TLS 트래픽을 전송할 수 있습니다. 클라이언트 구성이 완료되면 운영자는 서버를 상호 TLS 전용 모드로 구성 할 수 있습니다.

### Secure Naming

서버 ID는 인증서로 인코딩되지만 서비스 이름은 검색 서비스 또는 DNS를 통해 검색됩니다. 보안 이름 지정 정보는 서버 ID를 서비스 이름에 매핑합니다. ID A와 서비스 이름 B의 매핑은 "A가 서비스 B를 실행할 권한이 있음"을 의미합니다. 컨트롤 플레인은 apiserver를 감시하고 보안 이름 지정 매핑을 생성 한 다음 PEP에 안전하게 배포합니다. 다음 예에서는 인증에서 보안 이름 지정이 중요한 이유를 설명합니다.

서비스 데이터 저장소를 실행하는 합법적 인 서버가 인프라 팀 ID 만 사용한다고 가정합니다. 악의적 인 사용자는 테스트 팀 ID에 대한 인증서와 키를 가지고 있습니다. 악의적 인 사용자는 클라이언트에서 보낸 데이터를 검사하기 위해 서비스를 가장하려고합니다. 악의적 인 사용자는 테스트 팀 ID에 대한 인증서와 키를 사용하여 위조 된 서버를 배포합니다. 악의적 인 사용자가 DNS 스푸핑, BGP / 경로 하이재킹, ARP 스푸핑 등을 통해 데이터 저장소로 전송 된 트래픽을 성공적으로 하이재킹하고이를 위조 된 서버로 리디렉션했다고 가정합니다.

클라이언트가 데이터 저장소 서비스를 호출하면 서버의 인증서에서 테스트 팀 ID를 추출하고 테스트 팀이 안전한 이름 지정 정보로 데이터 저장소를 실행할 수 있는지 확인합니다. 클라이언트는 테스트 팀이 데이터 저장소 서비스를 실행할 수 없음을 감지하고 인증에 실패합니다.

보안 이름 지정은 HTTPS 트래픽에 대한 일반적인 네트워크 하이재킹으로부터 보호 할 수 있습니다. 또한 일반적인 네트워크 하이재킹으로부터 TCP 트래픽을 보호 할 수 있습니다. 그러나 보안 이름 지정은 DNS 스푸핑으로부터 보호되지 않습니다.이 경우 공격자가 DNS를 가로 채 대상의 IP 주소를 수정하기 때문입니다. 이는 TCP 트래픽에 호스트 이름 정보가 포함되어 있지 않고 라우팅을 위해 IP 주소에만 의존 할 수 있기 때문입니다. 실제로 DNS 도용은 클라이언트 측 Envoy가 트래픽을 수신하기 전에도 발생할 수 있습니다.

### Authentication Architecture

피어 및 요청 인증 정책을 사용하여 Istio 메시에서 요청을 수신하는 워크로드에 대한 인증 요구 사항을 지정할 수 있습니다. 메시 연산자는 .yaml 파일을 사용하여 정책을 지정합니다. 정책은 일단 배포되면 Istio 구성 저장소에 저장됩니다. Istio 컨트롤러는 구성 저장소를 감시합니다.

정책이 변경되면 새 정책은 필요한 인증 메커니즘을 수행하는 방법을 PEP에 알려주는 적절한 구성으로 변환됩니다. 제어 플레인은 공개 키를 가져와 JWT 유효성 검사를 위해 구성에 연결할 수 있습니다. 또는 Istiod는 Istio 시스템이 관리하는 키 및 인증서에 대한 경로를 제공하고 상호 TLS를 위해 이를 애플리케이션 파드에 설치합니다. ID 및 인증서 관리 섹션에서 자세한 정보를 찾을 수 있습니다.

Istio는 대상 엔드 포인트에 비동기 적으로 구성 정보를 보냅니다. 프록시가 구성을 수신하면 새 인증 요구 사항이 해당 파드에 즉시 적용됩니다.

요청을 보내는 클라이언트 서비스는 필요한 인증 메커니즘을 따를 책임이 있습니다. 요청 인증의 경우 애플리케이션은 JWT 자격 증명을 획득하고 요청에 첨부해야합니다. 피어 인증의 경우 Istio는 두 PEP 간의 모든 트래픽을 상호 TLS로 자동 업그레이드합니다. 인증 정책이 상호 TLS 모드를 비활성화하는 경우 Istio는 PEP간에 계속 평문 통신을 사용합니다. 이 동작을 재정의하려면 대상 규칙을 사용하여 상호 TLS 모드를 명시 적으로 비활성화합니다. 상호 TLS 인증 섹션에서 상호 TLS 작동 방식에 대해 자세히 알아볼 수 있습니다.

![Authentication Architecture](../.gitbook/assets/image%20%2840%29.png)

### Authentication Policies

이 섹션에서는 Istio 인증 정책의 작동 방식에 대한 자세한 내용을 제공합니다. 아키텍처 섹션에서 소개했지만, 인증 정책은 서비스 요청을 수신하는 워크로드에 적용됩니다. 상호 TLS에서 클라이언트 측 인증 규칙을 지정하려면 DestinationRule에서 TLSSettings를 지정해야합니다. TLS 설정 참조 문서에서 자세한 정보를 찾을 수 있습니다.

다른 Istio 구성과 마찬가지로 .yaml 파일에서 인증 정책을 지정할 수 있습니다. kubectl을 사용하여 정책을 배포합니다. 다음 예제 인증 정책은 app : reviews 레이블이있는 워크로드에 대한 전송 인증이 상호 TLS를 사용하도록 지정합니다.

```text
apiVersion: "security.istio.io/v1beta1"
kind: "PeerAuthentication"
metadata:
  name: "example-peer-policy"
  namespace: "foo"
spec:
  selector:
    matchLabels:
      app: reviews
  mtls:
    mode: STRICT
```

### Policy Storage

Istio는 메시 범위 정책을 루트 네임 스페이스에 저장합니다. 이러한 정책에는 메시의 모든 워크로드에 적용되는 empty selector 를 적용합니다. 네임 스페이스 범위가있는 정책은 해당 네임 스페이스에 저장되고, 따라서 네임 스페이스 내의 워크로드에만 적용됩니다. 따라서 관리자는 구성 파일의 selector 필드 설정을 통해 인증 정책이 구성한 조건과 일치하는 워크로드에만 적용하도록 설정 가능합니다.

### Selector Field

피어 및 요청 인증 정책은 선택기 필드를 사용하여 정책이 적용되는 워크로드의 레이블을 지정합니다. 다음 예제는 app : product-page 레이블이있는 워크로드에 적용되는 정책의 selector 필드를 보여줍니다.

```text
selector:
  matchLabels:
    app: product-page
```

selector 필드에 값을 제공하지 않으면 Istio는 정책을 정책의 저장소 범위에있는 모든 워크로드에 일치시킵니다. 따라서 selector 필드는 정책의 범위를 지정하는 도움이 됩니다.

* 메시 전체 정책 : 빈 선택기 필드가 있거나없는 루트 네임 스페이스에 대해 지정된 정책입니다.
* 네임 스페이스 전체 정책 : 빈 선택기 필드가 있거나없는 비 루트 네임 스페이스에 대해 지정된 정책입니다.
* 워크로드 별 정책 : 비어 있지 않은 선택기 필드가있는 일반 네임 스페이스에 정의 된 정책입니다.

피어 및 요청 인증 정책은 선택기 필드에 대해 동일한 계층 구조 원칙을 따르지만 Istio는 약간 다른 방식으로이를 결합하고 적용합니다.

메시 전체 피어 인증 정책은 하나만 있고 네임 스페이스 당 하나의 네임 스페이스 전체 피어 인증 정책 만있을 수 있습니다. 동일한 메시 또는 네임 스페이스에 대해 여러 메시 또는 네임 스페이스 전체 피어 인증 정책을 구성 할 때 Istio는 최신 정책을 무시합니다. 둘 이상의 워크로드 별 피어 인증 정책이 일치하면 Istio는 가장 오래된 것을 선택합니다.

Istio는 다음 순서를 사용하여 각 워크로드에 대해 가장 정확한 매칭 정책을 적용합니다.

1. workload-specific
2. namespace-wide
3. mesh-wide

Istio는 매칭되는 모든 요청 인증 정책을 결합하여 단일 요청에 의한 인증 정책에서 나온 것처럼 작동 할 수 있습니다. 따라서 메시 또는 네임 스페이스에 여러 메시 전체 또는 네임 스페이스 전체에 대한 정책을 적용할 수 있습니다. 그러나 이러한 정책 적용은 추천하지 않습니다.

### Peer Authentication

피어 인증 정책은 Istio가 대상 워크로드에 적용하는 상호 TLS 모드를 지정합니다. 다음 모드가 지원됩니다.

* PERMISSIVE : 워크로드는 상호 TLS 및 일반 텍스트 트래픽을 모두 허용합니다. 이 모드는 사이드카가없는 워크로드가 상호 TLS를 사용할 수없는 마이그레이션 중에 가장 유용합니다. 사이드카 주입으로 워크로드가 마이그레이션되면 모드를 STRICT로 전환해야합니다.
* STRICT : 워크로드는 상호 TLS 트래픽 만 허용합니다.
* 비활성화 : 상호 TLS가 비활성화됩니다. 보안 측면에서 자체 보안 솔루션을 제공하지 않는 한이 모드를 사용해서는 안됩니다.

모드가 설정되지 않으면 상위 범위의 모드가 상속됩니다. 모드가 설정되지 않은 메시 전체 피어 인증 정책은 기본적으로 PERMISSIVE 모드를 사용합니다.

다음 피어 인증 정책에서는 상호 TLS를 사용하기 위해 네임 스페이스 foo의 모든 워크로드가 필요합니다.

```text
apiVersion: "security.istio.io/v1beta1"
kind: "PeerAuthentication"
metadata:
  name: "example-policy"
  namespace: "foo"
spec:
  mtls:
    mode: STRICT
```

워크로드 별 피어 인증 정책을 사용하면 포트마다 서로 다른 상호 TLS 모드를 지정할 수 있습니다. 포트 전체 상호 TLS 구성에 대해 워크로드가 요청한 포트만 사용할 수 있습니다. 다음 예제에서는 app : example-app 워크로드에 대해 포트 80에서 상호 TLS를 비활성화하고 다른 모든 포트에 대해 네임 스페이스 전체 피어 인증 정책의 상호 TLS 설정을 사용합니다.

```text
apiVersion: "security.istio.io/v1beta1"
kind: "PeerAuthentication"
metadata:
  name: "example-workload-policy"
  namespace: "foo"
spec:
  selector:
     matchLabels:
       app: example-app
  portLevelMtls:
    80:
      mode: DISABLE
```

위의 피어 인증 정책은 아래의 서비스 구성이 example-app 워크로드의 요청을 example-service의 포트 80에 바인딩했기 때문에 만 작동합니다.

```text
apiVersion: v1
kind: Service
metadata:
  name: example-service
  namespace: foo
spec:
  ports:
  - name: http
    port: 8000
    protocol: TCP
    targetPort: 80
  selector:
    app: example-app
```

### Request Authentication

요청 인증 정책은 JWT \(JSON Web Token\)의 유효성을 검사하는 데 필요한 값을 지정합니다. 이러한 값에는 다음이 포함됩니다.

요청에서 토큰의 위치 발급자 또는 요청 공개 JSON 웹 키 세트 \(JWKS\) Istio는 요청 인증 정책의 규칙에 대해 제시된 토큰이있는 경우 이를 확인하고 유효하지 않은 토큰이 있는 요청을 거부합니다. 요청에 토큰이 없으면 기본적으로 수락됩니다. 토큰없이 요청을 거부하려면 특정 작업 \(예 : 경로 또는 작업\)에 대한 제한을 지정하는 권한 부여 규칙을 제공합니다.

요청 인증 정책은 각각 고유한 위치를 사용하는 경우 둘 이상의 JWT를 지정할 수 있습니다. 둘 이상의 정책이 워크로드와 일치하면 Istio는 단일 정책으로 지정된 것처럼 모든 규칙을 결합합니다. 이 동작은 다른 공급자의 JWT를 수락하도록 워크로드를 프로그래밍하는 데 유용합니다. 그러나 둘 이상의 유효한 JWT가 있는 요청은 이러한 요청의 출력 주체가 정의되지 않았기 때문에 지원되지 않습니다.

### Principals

피어 인증 정책 및 상호 TLS를 사용하는 경우 Istio는 피어 인증에서 source.principal로 ID를 추출합니다. 마찬가지로 요청 인증 정책을 사용할 때 Istio는 JWT의 ID를 request.auth.principal에 할당합니다. 이러한 주체를 사용하여 권한 부여 정책을 설정하고 원격 분석 출력으로 사용합니다.



## Authorization

Istio의 인증 기능은 메시의 워크로드에 대해 메시, 네임 스페이스 및 워크로드 전체의 액세스 제어를 제공합니다. 이 수준의 제어는 다음과 같은 이점을 제공합니다.

* 워크로드-워크로드 및 최종 사용자-워크로드 권한 부여.
* 간단한 API : 사용 및 유지 관리가 쉬운 단일 AuthorizationPolicy CRD가 포함되어 있습니다.
* 유연한 의미 체계 : 운영자는 Istio 속성에 대한 사용자 지정 조건을 정의하고 DENY 및 ALLOW 작업을 사용할 수 있습니다.
* 고성능 : Istio 인증은 Envoy에서 기본적으로 시행됩니다.
* 높은 호환성 : 기본적으로 gRPC, HTTP, HTTPS 및 HTTP2와 일반 TCP 프로토콜을 지원합니다.

### Authorization Architecture

각 Envoy 프록시는 런타임에 요청을 승인하는 승인 엔진을 실행합니다. 프록시에 요청이 들어 오면 권한 부여 엔진은 현재 권한 부여 정책에 대해 요청 컨텍스트를 평가하고 권한 결과를 ALLOW 또는 DENY로 반환합니다. 운영자는 .yaml 파일을 사용하여 Istio 권한 부여 정책을 지정합니다.

![Authorization Architecture](../.gitbook/assets/image%20%2842%29.png)

### Implicit Enablement

Istio의 인증 기능을 명시 적으로 활성화 할 필요는 없습니다. 액세스 제어를 적용하려면 워크로드에 권한 부여 정책을 적용하기 만하면됩니다. 승인 정책이 적용되지 않은 워크로드의 경우 Istio는 모든 요청을 허용하는 액세스 제어를 시행하지 않습니다.

권한 부여 정책은 ALLOW 및 DENY 작업을 모두 지원합니다. 거부 정책은 허용 정책보다 우선합니다. 허용 정책이 작업 부하에 적용되는 경우 정책의 규칙에서 명시 적으로 허용하지 않는 한 해당 작업 부하에 대한 액세스가 기본적으로 거부됩니다. 동일한 워크로드에 여러 권한 부여 정책을 적용하면 Istio는이를 추가적으로 적용합니다.

### Authorization Policies

권한 부여 정책을 구성하려면 AuthorizationPolicy 사용자 지정 리소스를 만듭니다. 권한 부여 정책에는 선택기, 작업 및 규칙 목록이 포함됩니다.

* 선택기 필드는 정책의 대상을 지정합니다.
* 작업 필드는 요청을 허용할지 거부할지 여부를 지정합니다.
* 규칙은 작업을 트리거 할시기를 지정합니다.
  * 규칙의 from 필드는 요청의 소스를 지정합니다.
  * 규칙의 to 필드는 요청의 작업을 지정합니다.
  * when 필드는 규칙을 적용하는 데 필요한 조건을 지정합니다.

다음 예제는 두 개의 소스 \(cluster.local / ns / default / sa / sleep 서비스 계정 및 dev 네임 스페이스\)가 앱을 사용하여 워크로드에 액세스 할 수 있도록 허용하는 권한 부여 정책을 보여줍니다. httpbin 및 version : v1 labels in the foo namespace when 전송 된 요청에 유효한 JWT 토큰이 있습니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
 name: httpbin
 namespace: foo
spec:
 selector:
   matchLabels:
     app: httpbin
     version: v1
 action: ALLOW
 rules:
 - from:
   - source:
       principals: ["cluster.local/ns/default/sa/sleep"]
   - source:
       namespaces: ["dev"]
   to:
   - operation:
       methods: ["GET"]
   when:
   - key: request.auth.claims[iss]
     values: ["https://accounts.google.com"]
```

다음 예제는 소스가 foo 네임 스페이스가 아닌 경우 요청을 거부하는 권한 부여 정책을 보여줍니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
 name: httpbin-deny
 namespace: foo
spec:
 selector:
   matchLabels:
     app: httpbin
     version: v1
 action: DENY
 rules:
 - from:
   - source:
       notNamespaces: ["foo"]
```

거부 정책이 허용 정책보다 우선합니다. 허용 정책과 일치하는 요청이 거부 정책과 일치하면 거부 될 수 있습니다. Istio는 먼저 거부 정책을 평가하여 허용 정책이 거부 정책을 우회 할 수 없는지 확인합니다.

### Policy Target

메타 데이터 / 네임 스페이스 필드 및 선택적 선택기 필드를 사용하여 정책의 범위 또는 대상을 지정할 수 있습니다. 메타 데이터 / 네임 스페이스 필드의 네임 스페이스에 정책이 적용됩니다. 값을 루트 네임 스페이스로 설정하면 정책이 메시의 모든 네임 스페이스에 적용됩니다. 루트 네임 스페이스의 값은 구성 가능하며 기본값은 istio-system입니다. 다른 네임 스페이스로 설정된 경우 정책은 지정된 네임 스페이스에만 적용됩니다.

선택기 필드를 사용하여 특정 워크로드에 적용 할 정책을 추가로 제한 할 수 있습니다. 선택기는 레이블을 사용하여 대상 워크로드를 선택합니다. 선택기는 {key : value} 쌍의 목록을 포함합니다. 여기서 키는 레이블의 이름입니다. 설정되지 않은 경우 권한 부여 정책은 권한 부여 정책과 동일한 네임 스페이스의 모든 워크로드에 적용됩니다.

예를 들어 읽기 허용 정책은 기본 네임 스페이스의 app : products 레이블이있는 워크로드에 대한 "GET"및 "HEAD"액세스를 허용합니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-read
  namespace: default
spec:
  selector:
    matchLabels:
      app: products
  action: ALLOW
  rules:
  - to:
    - operation:
         methods: ["GET", "HEAD"]
```

### Value Matching

권한 부여 정책의 대부분의 필드는 다음과 같은 일치하는 스키마를 모두 지원합니다.

* 정확히 일치 : 정확한 문자열 일치.
* 접두사 일치 : "_"로 끝나는 문자열. 예를 들어 "test.abc._ "는 "test.abc.com", "test.abc.com.cn", "test.abc.org"등과 일치합니다.
* 접미사 일치 : "_"로 시작하는 문자열. 예를 들어, "_ .abc.com"은 "eng.abc.com", "test.eng.abc.com"등과 일치합니다.
* 현재 상태 일치 : _는 비어 있지 않은 항목을 지정하는 데 사용됩니다. 필드가 있어야 함을 지정하려면 필드 이름 : \[ "_"\] 형식을 사용하십시오. 이것은 필드를 지정하지 않은 채로 두는 것과 다릅니다. 즉, 비어있는 것을 포함하여 모든 항목과 일치합니다.

몇 가지 예외가 있습니다. 예를 들어 다음 필드는 정확히 일치 만 지원합니다.

* when 섹션 아래의 키 필드
* 소스 섹션아래의 ipBlocks
* to 섹션 아래의 포트 필드

다음 예제 정책은 / test /  _접두사 또는_  / info 접미사가있는 경로에서 액세스를 허용합니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: tester
  namespace: default
spec:
  selector:
    matchLabels:
      app: products
  action: ALLOW
  rules:
  - to:
    - operation:
        paths: ["/test/*", "*/info"]
```

### Exclustion Matching

when 필드의 notValues, 소스 필드의 notIpBlocks, to 필드의 notPorts와 같은 부정적인 조건을 일치시키기 위해 Istio는 제외 일치를 지원합니다. 다음 예제에는 요청 경로가 / healthz가 아닌 경우 JWT 인증에서 파생 된 유효한 요청 주체가 필요합니다. 따라서 정책은 JWT 인증에서 / healthz 경로에 대한 요청을 제외합니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: disable-jwt-for-healthz
  namespace: default
spec:
  selector:
    matchLabels:
      app: products
  action: ALLOW
  rules:
  - to:
    - operation:
        notPaths: ["/healthz"]
    from:
    - source:
        requestPrincipals: ["*"]
```

다음 예제는 요청 주체가없는 요청에 대해 / admin 경로에 대한 요청을 거부합니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: enable-jwt-for-admin
  namespace: default
spec:
  selector:
    matchLabels:
      app: products
  action: DENY
  rules:
  - to:
    - operation:
        paths: ["/admin"]
    from:
    - source:
        notRequestPrincipals: ["*"]
```

### Allow-all and default deny-all authorization policies

다음 예제는 기본 네임 스페이스의 모든 워크로드에 대한 전체 액세스를 허용하는 간단한 모든 허용 권한 부여 정책을 보여줍니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: allow-all
  namespace: default
spec:
  action: ALLOW
  rules:
  - {}
```

다음 예는 관리 네임 스페이스의 모든 작업 부하에 대한 액세스를 허용하지 않는 정책을 보여줍니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: deny-all
  namespace: admin
spec:
  {}
```

### Custom Conditions

when 섹션을 사용하여 추가 조건을 지정할 수도 있습니다. 예를 들어 다음 AuthorizationPolicy 정의에는 request.headers \[version\]이 "v1"또는 "v2"라는 조건이 포함됩니다. 이 경우 키는 맵인 Istio 속성 request.headers의 항목 인 request.headers \[version\]입니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
 name: httpbin
 namespace: foo
spec:
 selector:
   matchLabels:
     app: httpbin
     version: v1
 action: ALLOW
 rules:
 - from:
   - source:
       principals: ["cluster.local/ns/default/sa/sleep"]
   to:
   - operation:
       methods: ["GET"]
   when:
   - key: request.headers[version]
     values: ["v1", "v2"]

```

조건의 지원되는 키 값은 조건 페이지에 나열됩니다.

### **Authenticated and unauthenticated identity**

워크로드를 공개적으로 액세스 할 수있게하려면 소스 섹션을 비워 두어야합니다. 이렇게하면 모든 \(인증 및 미 인증\) 사용자 및 워크로드의 소스가 허용됩니다. 예를 들면 다음과 같습니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
 name: httpbin
 namespace: foo
spec:
 selector:
   matchLabels:
     app: httpbin
     version: v1
 action: ALLOW
 rules:
 - to:
   - operation:
       methods: ["GET", "POST"]
```

인증 된 사용자 만 허용하려면 보안 주체를 대신 "\*"로 설정하십시오. 예를 들면 다음과 같습니다.

```text
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
 name: httpbin
 namespace: foo
spec:
 selector:
   matchLabels:
     app: httpbin
     version: v1
 action: ALLOW
 rules:
 - from:
   - source:
       principals: ["*"]
   to:
   - operation:
       methods: ["GET", "POST"]
```

### Using Istio authorization on plain TCP protocols

Istio 인증은 MongoDB와 같은 일반 TCP 프로토콜을 사용하는 워크로드를 지원합니다. 이 경우 HTTP 워크로드에 대해 수행 한 것과 동일한 방식으로 권한 부여 정책을 구성합니다. 차이점은 특정 필드와 조건은 HTTP 워크로드에만 적용된다는 것입니다. 이러한 필드에는 다음이 포함됩니다.

* 권한 부여 정책 개체의 소스 섹션에있는 request\_principals 필드
* 권한 부여 정책 개체의 작업 섹션에있는 호스트, 방법 및 경로 필드

지원되는 조건은 조건 페이지에 나열됩니다. TCP 워크로드에 HTTP 전용 필드를 사용하는 경우 Istio는 권한 부여 정책에서 HTTP 전용 필드를 무시합니다.

포트 27017에 MongoDB 서비스가 있다고 가정하면 다음 예제에서는 Istio 메시의 bookinfo-ratings-v2 서비스 만 MongoDB 워크로드에 액세스 할 수 있도록 권한 부여 정책을 구성합니다.

```text
apiVersion: "security.istio.io/v1beta1"
kind: AuthorizationPolicy
metadata:
  name: mongodb-policy
  namespace: default
spec:
 selector:
   matchLabels:
     app: mongodb
 action: ALLOW
 rules:
 - from:
   - source:
       principals: ["cluster.local/ns/default/sa/bookinfo-ratings-v2"]
   to:
   - operation:
       ports: ["27017"]
```

### Dependency on mutual TLS

Istio는 상호 TLS를 사용하여 클라이언트에서 서버로 일부 정보를 안전하게 전달합니다. 권한 부여 정책에서 다음 필드를 사용하기 전에 상호 TLS를 활성화해야합니다.

* 소스 섹션 아래의 주체 필드
* 소스 섹션 아래의 네임 스페이스 필드
* source.principal 사용자 지정 조건
* source.namespace 커스텀 조건
* connection.sni 커스텀 조건

승인 정책에서 위의 필드를 사용하지 않는 경우 상호 TLS가 필요하지 않습니다.

