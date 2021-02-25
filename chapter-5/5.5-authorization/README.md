# 5.5 Authorization

## Authorization

Istio의 인증 기능은 메시의 워크로드에 대해 메시, 네임 스페이스 및 워크로드 전체의 액세스 제어를 제공합니다. 이 수준의 제어는 다음과 같은 이점을 제공합니다.

* 워크로드-워크로드 및 최종 사용자-워크로드 권한 부여.
* 간단한 API : 사용 및 유지 관리가 쉬운 단일 AuthorizationPolicy CRD가 포함되어 있습니다.
* 유연한 의미 체계 : 운영자는 Istio 속성에 대한 사용자 지정 조건을 정의하고 DENY 및 ALLOW 작업을 사용할 수 있습니다.
* 고성능 : Istio 인증은 Envoy에서 기본적으로 시행됩니다.
* 높은 호환성 : 기본적으로 gRPC, HTTP, HTTPS 및 HTTP2와 일반 TCP 프로토콜을 지원합니다.

### Authorization Architecture

각 Envoy 프록시는 런타임에 요청을 승인하는 승인 엔진을 실행합니다. 프록시에 요청이 들어 오면 권한 부여 엔진은 현재 권한 부여 정책에 대해 요청 컨텍스트를 평가하고 권한 결과를 ALLOW 또는 DENY로 반환합니다. 운영자는 .yaml 파일을 사용하여 Istio 권한 부여 정책을 지정합니다.

![Authorization Architecture](../../.gitbook/assets/image%20%2842%29.png)

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

