# chapter-3 Traffic Management

## Traffic control

서비스 메쉬는 마이크로 서비스들 사이의 네트워킹을 가리키는 용어입니다. 서비스가 성장하면 할수록 서비스 메쉬의 규모가 커지고 복잡해질것입니다. 서비스 메쉬의 관리가 어려워진다는 의미는 service discovery, load balancing, failure recovery, metrics, monitoring 등의 문제를 해결해야 한다는 것입니다. 이뿐 아니라 A/B testing, canary rollouts, rate limiting, access control and end-to-end authentication 등의 더 많은 기능들 또한 서비스 메쉬가 풀어야할 요구사항들입니다.

이러한 요구사항들을 만족시키기 위한 기본적인 기능이 바로 트래픽 제어 입니다. 본 장에서는 Istio 의 트래픽 제어에 대한 내용들을 소개합니다.

